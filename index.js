const express = require('express')
const db = require('./db'); 
const bodyParser = require('body-parser')
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const baseUrl = 'http://localhost:3001/';

const { createClient } = require('redis')
const axios = require('axios')

const app = express()

const client = createClient()
client.on('error', err => console.log('Redis Client Error', err));



// app.use(express.json())

// const cacheMiddleware = (req, res, next) => {
//     const key = req.originalUrl;
//     client.get(key, (err, data) => {
//       if (err) throw err;
  
//       if (data !== null) {
//         res.send(JSON.parse(data));
//       } else {
//         next();
//       }
//     });
//   };

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });



//   app.use(async (req, res) => {
//     try {
//         const key = `http://localhost:3001/api/${req.originalUrl}`;
//         // const key = req.originalUrl;
//         console.log(key) ;

//         // Check if the key exists in Redis
//         client.get(key, async (err, reply) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Error checking Redis for data');
//             return;
//         }

//         if (reply) {
//             const data = JSON.parse(reply);
//             res.send(data);
//         } else {
//             const response = await axios.get(key)
//             // console.log('Axios Response:', response.status, response.data);
//             // .then(response => {
//             //     console.log(response.data);
//             // })
//             // .catch(error => {
//             //     console.error(error.message);
//             // });
//             // const response = await axios.get(baseUrl + req.originalUrl);
//             const data = response.data;

//             client.setex(key, 3600, JSON.stringify(data), (err, reply) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error storing data in Redis');
//             } else {
//                 console.log(`Data for ${key} stored in Redis with expiration`);
//                 res.send(data);
//             }
//             });
//         }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error fetching data from JSONPlaceholder');
//     }
// });


// app.use(async (req, res , next) => {
//     try {
//         const key = `http://localhost:3001/api/${req.originalUrl}`;

//         // Check if the key exists in Redis
//         client.get(key, async (err, reply) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error checking Redis for data');
//                 return;
//             }

//             if (reply) {
//                 const data = JSON.parse(reply);
//                 res.send(data);
//             } else {
//                 next();
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error fetching data from JSONPlaceholder');
//     }
// });


const cacheMiddleware = async (req, res, next) => {
    try {
        const key = `http://localhost:3001/api/${req.originalUrl}`;

        // Check if the key exists in Redis
        client.get(key, async (err, reply) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error checking Redis for data');
                return;
            }

            if (reply) {
                const data = JSON.parse(reply);
                res.send(data);
            } else {
                // If the data is not in the cache, proceed to the route controller
                next();
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error in caching middleware');
    }
};

// app.use('/api/users', userRoutes)
// app.use('/api/posts', postRoutes)

app.use('/api/users', cacheMiddleware, userRoutes);
app.use('/api/posts', cacheMiddleware, postRoutes);


db.once('open', () => {
    app.listen(3001);
    console.log('Server listening on port 3001');
});
