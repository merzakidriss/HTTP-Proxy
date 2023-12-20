// const Post = require('../models/Post');

// const getPosts = async (req, res) => {
//     try {
//         const posts = await Post.find();
//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getPostById = async (req, res) => {
//     const postId = req.params.postId;
//     try {
//         const post = await Post.find({id: postId});
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         res.json(post);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     getPosts,
//     getPostById,
// };


const { createClient } = require('redis');
const client = createClient();
const Post = require('../models/Post');

// Controller function to get posts
const getPosts = async (req, res) => {
    try {
        // Check if data is cached
        const key = 'posts';
        client.get(key, async (err, reply) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error checking Redis for data' });
                return;
            }

            if (reply) {
                const cachedPosts = JSON.parse(reply);
                res.json(cachedPosts);
            } else {
                // If not cached, fetch data from MongoDB
                const posts = await Post.find();

                // Cache the data
                client.setex(key, 3600, JSON.stringify(posts), (cacheErr, cacheReply) => {
                    if (cacheErr) {
                        console.error(cacheErr);
                        res.status(500).json({ message: 'Error storing data in Redis' });
                    } else {
                        console.log(`Posts data stored in Redis with expiration`);
                        res.json(posts);
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data from MongoDB' });
    }
};

// Controller function to get post by ID
// const getPostById = async (req, res) => {
//     const postId = req.params.postId;
//     console.log(postId);
//     try {
//         // Check if data is cached
//         const key = `posts/${postId}`;
//         client.get(key, async (err, reply) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).json({ message: 'Error checking Redis for data' });
//                 return;
//             }

//             if (reply) {
//                 const cachedPost = JSON.parse(reply);
//                 res.json(cachedPost);
//             } else {
//                 // If not cached, fetch data from MongoDB
//                 const post = await Post.findOne({ _id: postId });

//                 if (!post) {
//                     return res.status(404).json({ message: 'Post not found' });
//                 }

//                 // Cache the data
//                 client.setex(key, 3600, JSON.stringify(post), (cacheErr, cacheReply) => {
//                     if (cacheErr) {
//                         console.error(cacheErr);
//                         res.status(500).json({ message: 'Error storing data in Redis' });
//                     } else {
//                         console.log(`Post data stored in Redis with expiration`);
//                         res.json(post);
//                     }
//                 });
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching data from MongoDB' });
//     }
// };


// const getPostById = async (req, res) => {
//     const postId = req.params.postId;
//     try {
//         const post = await Post.find({id: postId});
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         else {
//             client.setex(key, 3600, JSON.stringify(post), (cacheErr, cacheReply) => {
//                 if (cacheErr) {
//                     console.error(cacheErr);
//                     res.status(500).json({ message: 'Error storing data in Redis' });
//                 } else {
//                     console.log(`Post data stored in Redis with expiration`);
//                     res.json(post);
//                 }
//             });
//         res.json(post);
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getPostById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const post = await Post.find({id: userId});
        if (!post) {
            return res.status(404).json({ message: 'User not found' });
        }
        client.setex(key, 3600, JSON.stringify(post), (cacheErr, cacheReply) => {
            if (cacheErr) {
                console.error(cacheErr);
                res.status(500).json({ message: 'Error storing data in Redis' });
            } else {
                console.log(`Post data stored in Redis with expiration`);
                res.json(post);
            }
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPosts,
    getPostById,
};
