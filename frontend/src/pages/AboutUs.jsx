import React from 'react'

const AboutUs = () => {
  return (
    <div className='bg-zinc-900 px-4 py-2 flex items-center justify-center h-auto min-h-screen'>
      <div className='bg-zinc-800 rounded-lg px-4 py-5 w-full md:w-5/6'>
        <h2 className='text-zinc-100 text-4xl mb-4'>About Us</h2>
        <p className='text-zinc-200 text-xl flex items-start w-full text-center md:text-justify'>
          Welcome to our online bookstore, a space designed to bring the love of reading to everyone, anytime, anywhere. Built using the cutting-edge MERN stack, styled with Tailwind CSS for sleek and responsive design, and powered by Redux for seamless state management, our platform ensures a smooth, efficient, and enjoyable experience for all book lovers. 
          <br /> <br />
          Whether you’re a casual reader or an avid bookworm, we offer a vast and diverse collection of books spanning various genres, including fiction, non-fiction, educational, self-help, and more. We believe that every reader should have access to the books they love, and with our easy-to-use login and signup features, you can create a personalized experience that caters to your preferences. Our intuitive cart system allows you to effortlessly browse, add, and purchase your favorite books, ensuring a hassle-free shopping experience from start to finish. We are committed to providing a platform that not only offers great books but also empowers readers to discover new worlds, authors, and stories. 
          <br /> <br />
          Our goal is to make reading accessible, enjoyable, and inspiring for everyone, offering a seamless online experience from book discovery to purchase. We pride ourselves on being more than just an online store—we are a community of readers who share a passion for books, learning, and imagination. So whether you’re looking for the latest bestsellers, timeless classics, or something unique, we invite you to explore our collection, find your next great read, and join us in celebrating the joy of reading. Dive in and let your literary journey begin today!
        </p>
      </div>
    </div>
  )
}

export default AboutUs