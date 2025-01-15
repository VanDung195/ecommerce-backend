const app = require('./src/app')
const PORT = 3052

const server = app.listen(PORT, () => {
    console.log(`server start with port ${PORT}`);
})