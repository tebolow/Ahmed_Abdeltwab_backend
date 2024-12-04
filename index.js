const express = require(`express`);
const app = express();
const DBConnect = require(`./utilities/configurations/DBConfigurations`);
const dotenv = require(`dotenv`);
dotenv.config();
const dataRoutes = require(`./routes/dataRoutes`);
const contactRoutes = require(`./routes/contactRoutes`);
const projectRoutes = require(`./routes/projectRoutes`);
const cors = require(`cors`);
const socialRoutes = require(`./routes/socialRoutes`);

(async function() {
    await DBConnect();
    app.listen(process.env.PORT, _=>{
        console.log(`Server started`);
    })
})();

app.use(cors({
    origin:[ process.env.ADMIN, process.env.USER ],
    credentials: true
}))

app.use(`/uploads`, express.static(`uploads`));
app.use(express.json());
app.use(`/data`, dataRoutes);
app.use(`/contacts`, contactRoutes);
app.use(`/projects`, projectRoutes);
app.use(`/socials`, socialRoutes);