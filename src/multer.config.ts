import multer, { diskStorage, memoryStorage } from 'multer';
const storage = multer.memoryStorage()
export const upload = multer({storage: storage})

// export const multerOptions = {
//   storage: memoryStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
      
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//       cb(null, `${file.fieldname}-${uniqueSuffix}${file.originalname}`);
//     },
//   }),
// };
