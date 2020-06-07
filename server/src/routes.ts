import express from 'express';
import PointsController from './controllers/pointsController';
import ItemsController from './controllers/itemsController';
import multer from 'multer';
import multerCongig from './config/multer'
import { celebrate, Joi } from 'celebrate'

//index, create, show, update, delete
const routes = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

const upload = multer(multerCongig);

routes.get('/items',itemsController.index);
routes.get('/points/:id',pointsController.show);
routes.get('/points',pointsController.index)
routes.post('/points',
celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required(),
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2)

    })
}, {abortEarly: false}),
upload.single('image'),
pointsController.create);


export default routes;