import { Router } from 'express';
import { ticktickServer } from './servers/ticktick';
import { ticktick } from '../../config.json';

const routesAPIV2 = Router();

routesAPIV2.get('/api/v2', (_, res) => {
  res.status(200).json({ message: 'Hello Word' })
})


routesAPIV2.post('/api/v2/login', async  (_, res) => {  
  
  if(!ticktick.token || ticktick.token?.length === 0) {
    const token = await ticktickServer.login(ticktick.username, ticktick.password)

    res.status(200).json({ token })
    return
  }

  res.status(200).json({ token: ticktick.token })
  return
})

routesAPIV2.get('/api/v2/data', (_, res) => {
  res.status(501).json({ error: 'Not implemented' })
})

routesAPIV2.post('/api/v2/habits/checkin', (_, res) => {
  res.status(501).json({ error: 'Not implemented' })
})

routesAPIV2.post('/api/v2/tasks/complete', (_, res) => {
  res.status(501).json({ error: 'Not implemented' })
})


export default routesAPIV2;