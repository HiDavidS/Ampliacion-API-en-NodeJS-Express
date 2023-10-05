import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const datos = require('./datos.json')

import express from 'express'
const html = '<h1>Bienvenido a la API</h1><p>Los comandos disponibles son:</p><ul><li>GET: /productos/</li><li>GET: /productos/id</li>    <li>POST: /productos/</li>    <li>DELETE: /productos/id</li>    <li>PUT: /productos/id</li>    <li>PATCH: /productos/id</li>    <li>GET: /usuarios/</li>    <li>GET: /usuarios/id</li>    <li>POST: /usuarios/</li>    <li>DELETE: /usuarios/id</li>    <li>PUT: /usuarios/id</li>    <li>PATCH: /usuarios/id</li></ul>'

const app = express()

const exposedPort = 1234

app.get('/', (req, res) => {
    res.status(200).send(html)
})

app.get('/productos/', (req, res) =>{
    try {
        let allProducts = datos.productos

        res.status(200).json(allProducts)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.get('/productos/:id', (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = datos.productos.find((producto) => producto.id === productoId)

        res.status(200).json(productoEncontrado)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.post('/productos', (req, res) => {
    try {
        let bodyTemp = ''

        req.on('data', (chunk) => {
            bodyTemp += chunk.toString()
        })
    
        req.on('end', () => {
            const data = JSON.parse(bodyTemp)
            req.body = data
            datos.productos.push(req.body)
        })
    
        res.status(201).json({"message": "success"})

    } catch (error) {
        res.status(204).json({"message": "error"})
    }
})

app.patch('/productos/:id', (req, res) => {
    let idProductoAEditar = parseInt(req.params.id)
    let productoAActualizar = datos.productos.find((producto) => producto.id === idProductoAEditar)

    if (!productoAActualizar) {
        res.status(204).json({"message":"Producto no encontrado"})
    }

    let bodyTemp = ''

    req.on('data', (chunk) => {
        bodyTemp += chunk.toString()
    })

    req.on('end', () => {
        const data = JSON.parse(bodyTemp)
        req.body = data
        
        if(data.nombre){
            productoAActualizar.nombre = data.nombre
        }
        
        if (data.tipo){
            productoAActualizar.tipo = data.tipo
        }

        if (data.precio){
            productoAActualizar.precio = data.precio
        }

        res.status(200).send('Producto actualizado')
    })
})

app.delete('/productos/:id', (req, res) => {
    let idProductoABorrar = parseInt(req.params.id)
    let productoABorrar = datos.productos.find((producto) => producto.id === idProductoABorrar)

    if (!productoABorrar){
        res.status(204).json({"message":"Producto no encontrado"})
    }

    let indiceProductoABorrar = datos.productos.indexOf(productoABorrar)
    try {
         datos.productos.splice(indiceProductoABorrar, 1)
    res.status(200).json({"message": "success"})

    } catch (error) {
        res.status(204).json({"message": "error"})
    }
})

app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})

app.listen( exposedPort, () => {
    console.log('Servidor escuchando en http://localhost:' + exposedPort)
})


// INICIO DE AMPLIACION-->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// 1er.endpoint que devuelve el listado completo de usuarios.

app.get('/usuarios/', (req, res) => {
    try {
        
        const listaUsuarios = datos.usuarios;

        res.status(200).json(listaUsuarios);
    } catch (error) {
        res.status(500).json({ "message": "Error al obtener la lista de usuarios" });
    }
});

// 2do. endpoint que devuelve los datos de un usuario en particular consignado por su número de id.

app.get('/usuarios/:id', (req, res) => {
    try {
        
        const usuarioId = parseInt(req.params.id);

        
        const usuarioEncontrado = datos.usuarios.find(usuario => usuario.id === usuarioId);

        if (usuarioEncontrado) {
            res.status(200).json(usuarioEncontrado);
        } else {
            res.status(404).json({ "message": "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al buscar el usuario" });
    }
});

// 3er endpoint que permite guardar un nuevo usuario.

app.post('/usuarios/', (req, res) => {
    try {
        let nuevoUsuario = req.body; 

        
        nuevoUsuario.id = generarIDUnico(); 

        
        datos.usuarios.push(nuevoUsuario);

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(500).json({ "message": "Error al crear el usuario" });
    }
});

// 4to endpoint que permite modificar algún atributo de un usuario

app.patch('/usuarios/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const datosModificados = req.body;

        
        const usuarioAActualizar = datos.usuarios.find(usuario => usuario.id === usuarioId);

        if (!usuarioAActualizar) {
            res.status(404).json({ "message": "Usuario no encontrado" });
        } else {
            
            for (const key in datosModificados) {
                if (Object.hasOwnProperty.call(datosModificados, key)) {
                    usuarioAActualizar[key] = datosModificados[key];
                }
            }

            res.status(200).json({ "message": "Usuario actualizado exitosamente", "usuarioActualizado": usuarioAActualizar });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al actualizar el usuario" });
    }
});

// 5to endpoint que permite borrar un usuario de los datos

app.delete('/usuarios/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);

        
        const usuarioABorrar = datos.usuarios.find(usuario => usuario.id === usuarioId);

        if (!usuarioABorrar) {
            res.status(404).json({ "message": "Usuario no encontrado" });
        } else {
            
            const indiceUsuarioABorrar = datos.usuarios.indexOf(usuarioABorrar);
            datos.usuarios.splice(indiceUsuarioABorrar, 1);

            res.status(200).json({ "message": "Usuario eliminado exitosamente" });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al eliminar el usuario" });
    }
});

// 6to endpoint que permite obtener el precio de un producto que se indica por id.

app.get('/productos/precio/:id', (req, res) => {
    try {
        const productoId = parseInt(req.params.id);

        
        const productoEncontrado = datos.productos.find(producto => producto.id === productoId);

        if (!productoEncontrado) {
            res.status(404).json({ "message": "Producto no encontrado" });
        } else {
            const precioProducto = productoEncontrado.precio;
            res.status(200).json({ "precio": precioProducto });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al obtener el precio del producto" });
    }
});

// 7mo endpoint que permite obtener el nombre de un producto que se indica por id

app.get('/productos/nombre/:id', (req, res) => {
    try {
        const productoId = parseInt(req.params.id);

        
        const productoEncontrado = datos.productos.find(producto => producto.id === productoId);

        if (!productoEncontrado) {
            res.status(404).json({ "message": "Producto no encontrado" });
        } else {
            const nombreProducto = productoEncontrado.nombre;
            res.status(200).json({ "nombre": nombreProducto });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al obtener el nombre del producto" });
    }
});

// 8vo endpoint que permite obtener el teléfono de un usuario que se indica por id.

app.get('/usuarios/telefono/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);

        
        const usuarioEncontrado = datos.usuarios.find(usuario => usuario.id === usuarioId);

        if (!usuarioEncontrado) {
            res.status(404).json({ "message": "Usuario no encontrado" });
        } else {
            const telefonoUsuario = usuarioEncontrado.telefono;
            res.status(200).json({ "telefono": telefonoUsuario });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al obtener el teléfono del usuario" });
    }
});

// 9no endpoint que permite obtener el nombre de un usuario que se indica por id.

app.get('/usuarios/nombre/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);

        
        const usuarioEncontrado = datos.usuarios.find(usuario => usuario.id === usuarioId);

        if (!usuarioEncontrado) {
            res.status(404).json({ "message": "Usuario no encontrado" });
        } else {
            const nombreUsuario = usuarioEncontrado.nombre;
            res.status(200).json({ "nombre": nombreUsuario });
        }
    } catch (error) {
        res.status(500).json({ "message": "Error al obtener el nombre del usuario" });
    }
});

// 10mo endpoint que permite obtener el total del stock actual de productos, la sumatoria de los precios individuales.

app.get('/productos/total-precio', (req, res) => {
    try {
        
        const listaProductos = datos.productos;

        
        const totalPrecio = listaProductos.reduce((total, producto) => total + producto.precio, 0);

        res.status(200).json({ "totalPrecio": totalPrecio });
    } catch (error) {
        res.status(500).json({ "message": "Error al calcular el total del precio de los productos" });
    }
});

// FIN DE AMPLIACION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>