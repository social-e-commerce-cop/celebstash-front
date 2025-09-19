import React from 'react';
import PostCard from './PostCard';
import { View, StyleSheet } from 'react-native';


const Post = () => (

    <View style={styles.container}>
    <PostCard
      userName="Kenny K Shot"
      userImage={require('../../assets/images/storyItem.jpg')}
      timeAgo="1h"
      verified={true}
      postText="This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystal... This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystal..."
      mainImage={require('../../assets/images/feed6.jpg')}
      price="$250"
      images={[
        require('../../assets/images/feed5.png'),
        require('../../assets/images/feed4.png'),
      ]}
      likes="15.2K"
      comments="500"
      shares="15,200"
      trending="#1 Trending"
    />
    <PostCard
      userName="King Kivumbi"
      userImage={require('../../assets/images/feed6.jpg')}
      timeAgo="1h"
      verified={true}
      postText="This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystal..."
      mainImage={require('../../assets/images/feed7.png')}
      price="$250"
      images={[
       
      ]}
      likes="15.2K"
      comments="500"
      shares="15,200"
      trending=""
    />
    <PostCard
      userName="Kenny K Shot"
      userImage={require('../../assets/images/storyItem.jpg')}
      timeAgo="1h"
      verified={true}
      postText="This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystal... This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystal..."
      mainImage={require('../../assets/images/feed6.jpg')}
      price="$250"
      images={[
        require('../../assets/images/feed5.png'),
        require('../../assets/images/feed4.png'),
      ]}
      likes="15.2K"
      comments="500"
      shares="15,200"
      trending="#1 Trending"
    />
    </View>
);

export default Post;

const styles = StyleSheet.create({
  container: {
    marginBottom: 68,
  }
});