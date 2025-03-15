const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const PAGE_ID_1 = process.env.PAGE_ID_1; // Masterclass
const PAGE_ID_2 = process.env.PAGE_ID_2; // DIY
const ACCESS_TOKEN_1 = process.env.ACCESS_TOKEN_1;
const ACCESS_TOKEN_2 = process.env.ACCESS_TOKEN_2;
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

const POSTS = [
  {
    "message": `
The Mentor's Chalk Student Workbook
Learning is a journey; this workbook is your guide.
https://www.amazon.com/dp/B0DXFVF69C
Learning is a journey; this workbook is your guide.
Students who engage with workbooks reinforce learning up to 70% more effectively.
The use of structured workbooks dates back to the 1800s when formal education became widespread.

#Mentorship #Learning #History
`,
    "imageUrl": `https://m.media-amazon.com/images/I/613mK0VraEL._SY425_.jpg`
  },
  {
    "message": `
Seeds of Change
Change starts with a single step.
https://www.amazon.com/dp/196595720X
Change starts with a single step.
Education reform movements have shaped schools for centuries, emphasizing equal access and innovation.
The education system in the U.S. was dramatically transformed in the early 20th century to prioritize inclusivity.

#Mentorship #Learning #History
`,
    "imageUrl": `https://m.media-amazon.com/images/I/714NYXxgtAL._SY466_.jpg`
  },
  {
    "message": `
Mastering the Classroom Vol 1. Classroom Management
Creating a positive learning environment where respect, structure, and growth thrive.
https://www.amazon.com/dp/B0DWNH1ZV9
Creating a positive learning environment where respect, structure, and growth thrive.
Effective classroom management reduces student misbehavior by up to 50%.
Classroom management principles have evolved from rigid discipline models to student-centered approaches.

#Education #Teaching #ClassroomManagement
`,
    "imageUrl": `https://m.media-amazon.com/images/I/61Dj4CUAoSL._SY385_.jpg`
  },
  {
    "message": `
The Mentor's Chalk
A The Mentor's Chalks impact lasts far beyond the classroom walls.
https://www.amazon.com/dp/B0DPQFK93G
A The Mentor's Chalks impact lasts far beyond the classroom walls.
Many historical teachers were also community leaders, shaping societal progress.
In the 19th century, teaching was one of the few professions open to women, giving them economic independence.

#Mentorship #Learning #History
`,
    "imageUrl": `https://m.media-amazon.com/images/I/71kkL1+G36L._SY466_.jpg`
  }
]

const postToFacebook = async (message, imageUrl = null) => {
  console.log("inn api", message, imageUrl)
  try {
    const url = imageUrl
      ? `https://graph.facebook.com/v22.0/${PAGE_ID_1}/photos`
      : `https://graph.facebook.com/v22.0/${PAGE_ID_1}/feed`;

    const payload = imageUrl
      ? { url: imageUrl, caption: message, access_token: ACCESS_TOKEN_1 }
      : { message: message, access_token: ACCESS_TOKEN_1 };

      console.log("before req")
    const response = await axios.post(url, payload);
    console.log("Post created successfully:", response.data);
  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
};

// API Route for scheduled Facebook posts
app.get("/api/post-to-facebook", (req, res) => {
  const hour = new Date().getHours();
  let messageIndex = [2, 13, 17, 20].indexOf(hour);
  if(messageIndex == -1){
    messageIndex = (Math.floor(Math.random() * 3) + 1)
  }
  // if (messageIndex !== -1) {
    console.log(messageIndex, 'message Index')

    postToFacebook(POSTS[messageIndex]?.message, POSTS[messageIndex]?.imageUrl);

    console.log(messageIndex, 'after api')

    res.json({ success: true, message: "Post scheduled successfully" });
  // }
  //  else {
  //   res.json({ success: false, message: "No post scheduled at this time" });
  // }
});

const getLatestYouTubeVideo = async () => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${GOOGLE_CLOUD_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=100`
    );

    if (response.data.items.length > 0) {
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      const video = response.data.items[randomNumber];
      console.log("vedio", video)
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high.url,
      };
    }
  } catch (error) {
    console.error("Error fetching YouTube video:", error.response?.data || error.message);
  }
  return null;
};

const postLink = async (message, link) => {
  try {
    const url = `https://graph.facebook.com/v18.0/${PAGE_ID_2}/feed`;
    const payload = { message: message, link: link, access_token: ACCESS_TOKEN_2 };

    console.log("before req")

    const response = await axios.post(url, payload);

    console.log("after req")
    console.log("Post created successfully:", response.data);
  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
};

// API Route for scheduled YouTube posts
app.get("/api/post-youtube-video", async (req, res) => {
  const latestVideo = await getLatestYouTubeVideo();
  if (latestVideo) {
    const message = `🎥 New Video Alert: ${latestVideo.title}\n\nWatch now: ${latestVideo.url}`;
    console.log("before api")
    postLink(message, latestVideo.url);
    console.log("after api")
    res.json({ success: true, message: "YouTube post scheduled successfully" });
  } else {
    res.json({ success: false, message: "No new video found." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel's API routes
