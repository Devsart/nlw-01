import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

    async index(request:Request,response:Response){
        //filtros de city, uf e items no query
        const { city,uf,items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()))

        const points = await knex('points').join('points_items','points.id','=','points_items.point_id')
        .whereIn('points_items.item_id',parsedItems)
        .where('city',String(city))
        .where('uf',String(uf))
        .distinct()
        .select('points.*');

        const serializedPoints = points.map(point =>{
            return {
                ...point,
                img_url:`http://192.168.1.4:3333/uploads/${point.image}`
    
            }
        })

        return response.json(serializedPoints)
    }

    async show(request:Request,response:Response){
        const id = request.params.id

        const point = await knex('points').where('id',id).first();
        if(!point){
            return response.status(400).json({ message: 'point not found.'})
        }

        const serializedPoint = {
                ...point,
                img_url:`http://192.168.1.4:3333/uploads/${point.image}`
            }

        const items = await knex('items')
        .join('points_items','items.id','=','points_items.item_id')
        .where('points_items.point_id', id)
        .select('items.title');

        return response.json({point: serializedPoint, items})
    }
    


    async create(request:Request,response:Response){
        const{
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
        
        const trx = await knex.transaction();
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        };

        const ids = await trx('points').insert(point);
        const point_id = ids[0]
    
        const pointsItems = 
            items.split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id:number) =>{
                return{
                    item_id,
                    point_id
                }
            });
    
        await trx('points_items').insert(pointsItems);
        
        await trx.commit();

        return response.json({
            id: point_id,
            ...point,
        })
    }
}

export default PointsController