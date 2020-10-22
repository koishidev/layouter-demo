import React from 'react'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Box from '@material-ui/core/Box'
import ClientHelper, { Inputs } from '@koishidev/layouter-client-helper'
import SVGFormFields from './SVGForm'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Dialog from './Dialog'
import BatchResult from './BatchResult'
import config from './demo.config.json'

const batchContents = {
  1: [
    {
      uuid: '116c0e92-2ca4-4152-8069-eb842cf128af',
      value: '木村拓哉',
    },
    {
      uuid: 'b118451a-b57d-4ac6-9c9a-41201b23eca0',
      value: '東京都港区赤坂1-12-32',
    },
  ],
  2: [
    {
      uuid: '116c0e92-2ca4-4152-8069-eb842cf128af',
      value: '中居正広',
    },
    {
      uuid: 'b118451a-b57d-4ac6-9c9a-41201b23eca0',
      value: '東京都千代田区1-1-1',
    },
  ],
  3: [
    {
      uuid: '116c0e92-2ca4-4152-8069-eb842cf128af',
      value: '草彅剛',
    },
  ],
  4: [
    {
      uuid: '116c0e92-2ca4-4152-8069-eb842cf128af',
      value: '香取慎吾',
    },
  ],
  5: [
    {
      uuid: '116c0e92-2ca4-4152-8069-eb842cf128af',
      value: '稲垣吾郎',
    },
  ],
  6: [],
}
export default function App() {
  const helper = new ClientHelper(
    config.token,
    config.layoutId,
    process.env.REACT_APP_API_ROOT
  )
  const [svgs, setSvgs] = React.useState<string[]>([])
  const [data, setData] = React.useState<Inputs>(config.inputs as Inputs)
  const [loading, setLoading] = React.useState(false)
  const [pngs, setPNGs] = React.useState<ArrayBuffer[]>([])
  const [batchResults, setBatchResults] = React.useState<{
    [x: string]: string[]
  }>({})
  const [pdf, setPDF] = React.useState<string>('')

  React.useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const srcArr = await helper.getInit()
        setSvgs(srcArr)
      } catch (error) {
        console.log(error)
      }
      setLoading(false)
    })()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    svgId: string
  ) => {
    const inputId = event.target.name
    const value = event.target.value

    setData({
      ...data,
      [svgId]: {
        ...data[svgId],
        elements: {
          ...data[svgId].elements,
          [inputId]: {
            ...data[svgId].elements[inputId],
            value,
          },
        },
      },
    })
  }

  const handlePreview = async () => {
    try {
      setLoading(true)
      console.log(ClientHelper.prepareData(data))
      const res = await helper.update(ClientHelper.prepareData(data))
      setSvgs(res.svg)
      setPDF(res.pdf)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  const handleGetPng = async () => {
    setLoading(true)
    try {
      const res = await helper.toPng(
        ClientHelper.prepareData(data),
        'thumbnail'
      )
      setPNGs(res)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  const handleBatchRequest = async () => {
    setLoading(true)
    try {
      const res = await helper.batchCreatePngs(batchContents)
      setBatchResults(res)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  return (
    <>
      {loading && <LinearProgress color='primary' />}
      <Container>
        <Box px={2} pt={4} mb={2} display='flex' justifyContent='space-between'>
          <Button variant='contained' onClick={handlePreview}>
            プレビュー反映
          </Button>
          <Button variant='contained' onClick={handleGetPng}>
            PNG変換
          </Button>
          <Button variant='contained' onClick={handleBatchRequest}>
            バッチリクエスト
          </Button>
        </Box>

        {Object.keys(data).map((key, i) => (
          <Box mb={4} key={key}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box key={i}>
                  {svgs[i] && (
                    <img src={`data:image/svg+xml;base64,${svgs[i]}`} />
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <form noValidate autoComplete='off' key={key}>
                  <SVGFormFields
                    fields={data[key].elements}
                    onChange={(event) => handleChange(event, key)}
                  />
                </form>
              </Grid>
            </Grid>
          </Box>
        ))}
        <Box>
          {pdf && (
            <embed
              width='100%'
              height='100%'
              type='application/pdf'
              src={`data:application/pdf;base64,${pdf}`}
            />
          )}
        </Box>
        <Dialog data={pngs} onClose={() => setPNGs([])} />
        <BatchResult
          data={batchResults}
          onClose={() => setBatchResults({})}
          src={batchContents}
        />
      </Container>
    </>
  )
}
