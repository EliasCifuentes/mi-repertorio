import express from 'express'
import fs, { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'
import 'dotenv/config'

// Crear instancia de Express
const app = express()

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = join(__dirname, 'repertorio.json')

// Middleware
app.use(express.json())
app.use(express.static(__dirname))
app.use(cors())

// Devolver una página web como respuesta a una consulta GET
app.get('/', (_, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

// POST para agregar cancion al repertorio
app.post('/canciones', async (req, res) => {
  const { id, titulo, artista, tono } = req.body

  // Validar que no existan campos vacios
  if (!id || !titulo || !artista || !tono) {
    console.error('Todos los campos son obligatorios')
    return res.status(400).json({ message: 'Todos los campos son obligatorios' })
  }

  let canciones = []

  // Leer el repertorio actual
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    canciones = JSON.parse(data)
  } catch (error) {
    console.error('No se puede leer el archivo', error)
    return res.status(404).json({ message: 'No se puede leer el archivo o no existe' })
  }
  canciones.push({ id, titulo, artista, tono })
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(canciones, null, 2))
    console.log('cancion agregada')
    return res.status(200).json({ message: 'Cancion Agregada Correctamente' })
  } catch (error) {
    console.error('No se puedo agregar la Cancion', error)
    return res.status(500).json({ message: 'Error al guardar la canción' })
  }
})

// GET para obtener la lista de canciones
app.get('/canciones', async (_, res) => {
  try {
    const canciones = JSON.parse(readFileSync(DB_PATH, 'utf8')) 
    res.json(canciones)
  } catch (error) {
    console.log('No existen canciones o no se pudo conectar con el servidor', error)
    return res.status(500).json({ message: 'No se pudieron obtener las canciones' }) 
  }
})

// DELETE para eliminar una cancion
app.delete('/canciones/:id', async (req, res) => {
  const { id } = req.params
  try {
    const canciones = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    const index = canciones.findIndex(c => String(c.id) === String(id))

    if (index === -1) {
      console.log('Cancion no encontrada')
      return res.status(404).json({ message: 'Canción no encontrada' })
    }

    canciones.splice(index, 1)
    fs.writeFileSync(DB_PATH, JSON.stringify(canciones, null, 2))
    console.log('Cancion eliminada')
    return res.status(200).json({ message: 'Canción eliminada con éxito' })
  } catch (error) {
    console.error('Error al eliminar la canción:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// PUT para actualizar una cancion
app.put('/canciones/:id', async (req, res) => {
  const { id } = req.params
  const cancion = req.body
  try {
    const canciones = JSON.parse(fs.readFileSync(DB_PATH))
    const index = canciones.findIndex(c => String(c.id) === String(id))
    if (index === -1) {
      console.error('No se encuentra la cancion')
      return res.status(404).json({ message: 'Cancion no encontrada' })
    }
    canciones[index] = cancion
    fs.writeFileSync(DB_PATH, JSON.stringify(canciones))
    console.log('Cancion modificada con exito')
    return res.status(200).json({ message: 'Cancion modificada con exito' })
  } catch (error) {
    console.error('No se modifico la cancion')
    return res.status(500).json({ message: 'No se pudo modificar la cancion' })
  }
})

// Levantar servidor
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`)
})
