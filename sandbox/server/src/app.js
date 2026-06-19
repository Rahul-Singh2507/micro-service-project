import express from "express"

import morgan from"morgan"
import { createPod} from "./kubernetes/pod.js"
import { createService } from "./kubernetes/service.js"  

import { v7 as uuid } from "uuid"
const app = express()
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({message:"Sandbox service is healthy"}     )
})
app.post("/api/sandbox/start",async (req,res)=>{
 const sandboxId = uuid()
await Promise.all([createPod(sandboxId),createService(sandboxId)])
res.status(201).json({
    message: "Sandbox created successfully",
    sandboxId,
   previewUrl: `http://localhost/preview/${sandboxId}`,
   agentUrl: `http://localhost/agent/${sandboxId}`
})          
    
})
export default app
