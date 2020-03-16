const Koa = require('koa')
const Router = require('koa-router')
const nanoid = require('nanoid')
const bodyParser = require('koa-bodyparser')
const mathjax = require('mathjax')
const mongoose = require('mongoose')

let MathJax

let app = new Koa()
let router = new Router()

const {
  getImageForImg,
  getImageForSocialPreview,
} = require('./functions/sharp')

const config = require('./config')

const Math = require('./models/math')

const formError = (err) => {
  return {
    ok: false,
    error: err,
  }
}

const getSvg = (data) => MathJax.startup.adaptor.innerHTML(MathJax.tex2svg(data, {display: true}))

router.all('/generateSocial', async (ctx) => {
  const data = ctx.request.body.data || ctx.request.query.data
  if (!data) {
    ctx.status = 400
    ctx.body = JSON.stringify(formError('No data'))
    return
  }

  const svg = getSvg(data)
  const buffer = await getImageForSocialPreview(svg)
  ctx.type = 'image/png'
  ctx.body = buffer
})
router.all('/add', async (ctx) => {
  const data = ctx.request.body.data || ctx.request.query.data
  if (!data || data.length < 6) {
    ctx.status = 400
    ctx.body = JSON.stringify(formError('Too short (<6 chars)'))
    return
  }
  let id = nanoid(8)
  await Math.create({
    id,
    data,
  })
  ctx.body = JSON.stringify({
    ok: true,
    id,
  })
})
router.all('/:id', async (ctx) => {
  console.log(ctx.request.header['user-agent'])
  console.log(ctx.request.header.accept)
  const {id} = ctx.params
  let ua = ctx.request.header['user-agent']
  const math = await Math.findOne({id})

  if (!math) {
    ctx.status = 404
    ctx.body = 'Not Found'
    return
  }

  const {data} = math

  if (ua.startsWith('TelegramBot') || ua.match('vkShare')) {
    const svg = getSvg(data)
    const buffer = await getImageForSocialPreview(svg)
    ctx.type = 'image/png'
    ctx.body = buffer
    return
  }

  ctx.body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Math #${id}</title>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML'></script>
  <style>
    body {margin: 0} 
    #math {margin:0; padding:20px; font-size: 2rem}
    @media print {
      body {
        display: inline-block;
        overflow: hidden;
      }
    }
  </style>
</head>
<body>
<p id="math">$$${data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}$$</p>
</body>
</html>`
})
router.all('/img/:id', async (ctx) => {
  let id = ctx.params.id
  const math = await Math.findOne({id})

  if (!math) {
    ctx.status = 404
    ctx.body = 'Not Found'
    return
  }

  const {data} = math

  const svg = getSvg(data)
  const buffer = await getImageForImg(svg)
  ctx.type = 'image/png'
  ctx.body = buffer
})

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${new Date().toLocaleString()}: ${ctx.method} ${ctx.url} - ${ms}ms`)
})
app.use(bodyParser())
app.use(router.routes())

void (async () => {
  MathJax = await mathjax.init({
    loader: {
      paths: {mathjax: 'mathjax/es5'},
      load: ['input/tex', 'output/svg'],
    },
  })
  await mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const {port} = config
  app.listen(port)
  console.log(`Math server is listening at ${port}`)
})()
