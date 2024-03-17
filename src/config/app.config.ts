export default () => ({
  appSecret: process.env.APP_SECRET,
  dbUrl: process.env.DB_URL,
  dbName: process.env.DB_NAME,
  link: process.env.LINK,

  mailerPort: process.env.mailerPort, 
  mailerUser: process.env.mailerUser,
  mailerPass: process.env.mailerPass,
  mailerHost: process.env.mailerHost,
  mailerSender: process.env.mailerSender,
})