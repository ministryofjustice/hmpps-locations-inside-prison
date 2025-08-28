import { Router } from 'express'
import multer from 'multer'

export default function setUpMultipartFormDataParsing(): Router {
  const router = Router({ mergeParams: true })
  const maxUploadSize = 100 * 1000 // 100kb
  const upload = multer({ dest: 'uploads/', limits: { fileSize: maxUploadSize } })

  router.use(upload.single('file'))

  return router
}
