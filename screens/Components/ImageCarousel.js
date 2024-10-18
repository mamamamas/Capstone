import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Image, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// Function to shuffle images and ensure no duplicates are back to back
const shuffleImages = (images) => {
  const shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  // Ensure no two consecutive images are the same
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i] === shuffled[i - 1]) {
      const swapIndex = (i + 1) % shuffled.length; // Find next available image to swap
      [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
    }
  }

  return shuffled;
};

const ImageCarousel = ({ images }) => {
  const scrollViewRef = useRef(null);
  const position = useRef(0);
  const [randomizedImages, setRandomizedImages] = useState([]);

  useEffect(() => {
    // Shuffle the images initially
    const shuffledImages = shuffleImages(images);
    // Set the shuffled images and duplicate for infinite scroll
    setRandomizedImages([...shuffledImages, ...shuffledImages]);
  }, [images]);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      position.current += width; // Move to the next image
      if (position.current >= width * randomizedImages.length) {
        // Reset position when reaching the end (smooth reset)
        position.current = 0;
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      } else {
        scrollViewRef.current.scrollTo({ x: position.current, animated: true });
      }
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(scrollInterval); // Cleanup on unmount
  }, [randomizedImages]);

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // Disable manual scrolling
      >
        {randomizedImages.map((image, index) => (
          <Image key={index} source={image} style={styles.image} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width,
    height: height * 1.05,
    resizeMode: 'cover',
  },
});

export default ImageCarousel;
