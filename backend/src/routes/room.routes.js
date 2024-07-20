import { Router } from "express";
import {createRoom,deleteRoom,getElementsRoom,jointRoom,updateRoom} from "../controllers/room.controllers.js";



const router = Router();


router.route('/createroom').post(createRoom)
router.route('/updateroom').post(updateRoom)
router.route('/deleteroom').post(deleteRoom)
router.route('/joinroom').get(jointRoom)
router.route('/getroom').get(getElementsRoom);



export default router;