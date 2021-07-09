const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const log = require("./utils/logger");
const config = require("./config");
const errorHandler = require("./api/libs/errorHandler");
const authJWT = require("./api/libs/auth");
const userController = require("./api/recursos/user/user.controller");
const userRouter = require("./api/recursos/user/user.routes");
const journeyRouter = require("./api/recursos/journey/journey.routes");
const leagueRouter = require("./api/recursos/league/league.routes");
const teamRouter = require("./api/recursos/team/team.router");
const soccerGameRouter = require("./api/recursos/soccerGame/soccerGame.routes");
const reportRouter = require("./api/recursos/report/report.routes");

passport.use(authJWT);


mongoose.connect('mongodb://localhost:27017/GestorTorneos', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
  var name = 'ADMIN';
  var username = 'ADMIN1';
  var password = '123456';
  var rol = 'ROLE_ADMIN';
  var usuario = new userController();

  usuario.name = name
  usuario.username = username
  usuario.password = password
  usuario.rol = rol

  userController.find({name: usuario.name}).exec((err, usuarioEncontrado)=>{
      if(usuarioEncontrado && usuarioEncontrado.length >= 1){
          console.log('El usuario Administrador ya ha sido creado');
      }else{
          bcrypt.hash(usuario.password, null, null, (err, passEncriptada)=>{
              usuario.password = passEncriptada
              usuario.save((err, usuarioGuardado)=>{
                  if(err) console.log('Error al guardar este usuario');

                  if(usuarioGuardado){
                      console.log(usuarioGuardado)
                  }else{
                      console.log('No se ha podido guardar correctamente este usuario');   
                  }
              })
          })
      }
  })

  app.listen(3000, function(){
      console.log('El servidor esta corriendo correctamente')
  })
}).catch(err => console.log(err));
mongoose.connection.on("error", () => {
  log.error("Fallo la conexion a mongodb");
  process.exit(1);
});
mongoose.set("useFindAndModify", false);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "image/*", limit: "25mb" }));

app.use(cors());

app.use(
  morgan("short", {
    stream: {
      write: (message) => log.info(message.trim()),
    },
  })
);

app.use(passport.initialize());

app.use("/user", userRouter);
app.use("/journey", journeyRouter);
app.use("/league", leagueRouter);
app.use("/team", teamRouter);
app.use("/soccerGame", soccerGameRouter);
app.use("/report", reportRouter);

app.use(errorHandler.procesarErroresDeDB);
app.use(errorHandler.procesarErroresDeTamañoDeBody);
if (config.ambiente === "prod") {
  app.use(errorHandler.erroresEnProduccion);
} else {
  app.use(errorHandler.erroresEnDesarrollo);
}

const server = app.listen(config.puerto, () => {
  log.info("Escuchando en el puerto 3000");
});

module.exports = {
  app,
  server,
};
