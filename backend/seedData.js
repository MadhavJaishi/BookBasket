import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";
import Book from "./models/book.js";
import UserBook from "./models/userBook.js";
import Order from "./models/order.js";
import Discussion from "./models/discussion.js";
import Comment from "./models/comment.js";
import BookClub from "./models/bookClub.js";
import Review from "./models/review.js";

const BOOKS_DATA = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 549,
    discountPercent: 15,
    genre: "Self-Help",
    desc: "An easy and proven way to build good habits and break bad ones. Clear draws on biology, psychology, and neuroscience to create an easy-to-understand guide for making good habits inevitable.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    publisher: "Avery",
    publishedDate: "2018-10-16",
    pageCount: 320,
    isbn: "978-0735211292",
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    price: 699,
    discountPercent: 20,
    genre: "History",
    desc: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance?",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1700180941i/23692271.jpg",
    publisher: "Harper",
    publishedDate: "2015-02-10",
    pageCount: 443,
    isbn: "978-0062316097",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    price: 799,
    discountPercent: 25,
    genre: "Sci-Fi",
    desc: "Set on the desert planet Arrakis, Dune tells the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only valuable substance is the spice melange.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    publisher: "Chilton Books",
    publishedDate: "1965-08-01",
    pageCount: 688,
    isbn: "978-0441172719",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 620,
    discountPercent: 10,
    genre: "Psychology",
    desc: "Engaging the reader in a lively conversation about how we think, Kahneman reveals where we can and cannot trust our intuitions and how we can tap into the benefits of slow thinking.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg",
    publisher: "Farrar, Straus and Giroux",
    publishedDate: "2011-10-25",
    pageCount: 499,
    isbn: "978-0374275631",
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    price: 399,
    discountPercent: 0,
    genre: "Philosophy",
    desc: "A series of personal writings by Marcus Aurelius, Roman Emperor from AD 161 to 180, recording his private notes to himself and ideas on Stoic philosophy.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421618636i/30659.jpg",
    publisher: "Penguin Classics",
    publishedDate: "2006-04-27",
    pageCount: 256,
    isbn: "978-0140449334",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    price: 499,
    discountPercent: 15,
    genre: "Business",
    desc: "Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to master complicated information.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg",
    publisher: "Grand Central Publishing",
    publishedDate: "2016-01-05",
    pageCount: 304,
    isbn: "978-1455586691",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 450,
    discountPercent: 12,
    genre: "Business",
    desc: "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1581527774i/41881472.jpg",
    publisher: "Harriman House",
    publishedDate: "2020-09-08",
    pageCount: 252,
    isbn: "978-0857197689",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 499,
    discountPercent: 18,
    genre: "Fiction",
    desc: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
    publisher: "Viking",
    publishedDate: "2020-09-29",
    pageCount: 304,
    isbn: "978-0525559474",
  },
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    price: 599,
    discountPercent: 10,
    genre: "Fiction",
    desc: "The story of Klara, an Artificial Friend with outstanding observational qualities, who, from her place in the store, watches carefully the behaviour of those who come in to browse.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg",
    publisher: "Knopf",
    publishedDate: "2021-03-02",
    pageCount: 303,
    isbn: "978-0593318171",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 650,
    discountPercent: 20,
    genre: "Sci-Fi",
    desc: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed. Except right now, he doesn't know that.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
    publisher: "Ballantine Books",
    publishedDate: "2021-05-04",
    pageCount: 496,
    isbn: "978-0593135204",
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    price: 350,
    discountPercent: 0,
    genre: "Psychology",
    desc: "Psychiatrist Viktor Frankl's memoir has riveted generations of readers with its descriptions of life in Nazi death camps and its lessons for spiritual survival.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535419394i/40611.jpg",
    publisher: "Beacon Press",
    publishedDate: "2006-06-01",
    pageCount: 165,
    isbn: "978-0807014295",
  },
  {
    title: "Beyond Good and Evil",
    author: "Friedrich Nietzsche",
    price: 420,
    discountPercent: 15,
    genre: "Philosophy",
    desc: "Nietzsche takes up and expands upon many of the themes taught in Zarathustra, offering a devastating critique of traditional Western morality and metaphysics.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388185233i/123632.jpg",
    publisher: "Vintage",
    publishedDate: "1989-12-17",
    pageCount: 240,
    isbn: "978-0679724650",
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    price: 480,
    discountPercent: 22,
    genre: "Thriller",
    desc: "Alicia Berenson’s life is seemingly perfect. One evening she shoots her husband five times in the face, and then never speaks another word. Theo Faber is a criminal psychotherapist determined to unravel her mystery.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668782119i/40097951.jpg",
    publisher: "Celadon Books",
    publishedDate: "2019-02-05",
    pageCount: 336,
    isbn: "978-1250301696",
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    price: 899,
    discountPercent: 15,
    genre: "Biography",
    desc: "Based on more than forty interviews with Jobs conducted over two years, this is the definitive biography of the ultimate icon of inventiveness and imagination.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg",
    publisher: "Simon & Schuster",
    publishedDate: "2011-10-24",
    pageCount: 656,
    isbn: "978-1451648539",
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    price: 750,
    discountPercent: 20,
    genre: "Fantasy",
    desc: "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352161i/186074.jpg",
    publisher: "DAW Books",
    publishedDate: "2007-03-27",
    pageCount: 662,
    isbn: "978-0756404741",
  },
  {
    title: "A Promised Land",
    author: "Barack Obama",
    price: 999,
    discountPercent: 30,
    genre: "Biography",
    desc: "A riveting, deeply personal account of history in the making—from the president who inspired us to believe in the power of democracy.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1600357110i/55361205.jpg",
    publisher: "Crown",
    publishedDate: "2020-11-17",
    pageCount: 768,
    isbn: "978-1524763169",
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    price: 650,
    discountPercent: 18,
    genre: "History",
    desc: "Fascinating examination of how geographical and environmental factors shaped the modern world and why Eurasian peoples conquered or displaced others.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1453215833i/1842.jpg",
    publisher: "W. W. Norton & Company",
    publishedDate: "1997-03-01",
    pageCount: 498,
    isbn: "978-0393317558",
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    price: 699,
    discountPercent: 15,
    genre: "Science",
    desc: "Cosmos retraces the fourteen billion years of cosmic evolution that have transformed matter into consciousness, exploring science, civilization, and human destiny.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348620764i/55030.jpg",
    publisher: "Random House",
    publishedDate: "1980-10-12",
    pageCount: 365,
    isbn: "978-0345331359",
  },
  {
    title: "The Song of Achilles",
    author: "Madeline Miller",
    price: 520,
    discountPercent: 12,
    genre: "Romance",
    desc: "A breathtaking reimagining of Homer's Iliad—a tale of gods, kings, immortal fame, and the human heart, forged in the golden age of heroes.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1334407844i/11250317.jpg",
    publisher: "Ecco",
    publishedDate: "2012-08-28",
    pageCount: 378,
    isbn: "978-0062060624",
  },
  {
    title: "The Selected Poems of Emily Dickinson",
    author: "Emily Dickinson",
    price: 349,
    discountPercent: 0,
    genre: "Poetry",
    desc: "A luminous collection of the transformative, intimate, and enigmatic poems of Emily Dickinson exploring nature, faith, mortality, and eternity.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388277258i/112203.jpg",
    publisher: "Modern Library",
    publishedDate: "2001-05-15",
    pageCount: 352,
    isbn: "978-0679783350",
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    price: 450,
    discountPercent: 10,
    genre: "Spirituality",
    desc: "A guide to spiritual enlightenment. Tolle demonstrates how living in the present moment is the truest path to happiness, peace, and freedom.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657564252i/6708.jpg",
    publisher: "New World Library",
    publishedDate: "1999-10-06",
    pageCount: 229,
    isbn: "978-1577314806",
  },
  {
    title: "Life 3.0: Being Human in the Age of Artificial Intelligence",
    author: "Max Tegmark",
    price: 680,
    discountPercent: 20,
    genre: "Technology",
    desc: "How will AI affect crime, war, justice, jobs, society and our very sense of being human? MIT professor Max Tegmark explores the rise of artificial intelligence.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1499778449i/34272565.jpg",
    publisher: "Knopf",
    publishedDate: "2017-08-29",
    pageCount: 384,
    isbn: "978-1101946596",
  },
  {
    title: "Can't Hurt Me",
    author: "David Goggins",
    price: 599,
    discountPercent: 15,
    genre: "Personal Growth",
    desc: "Master Your Mind and Defy the Odds. David Goggins shares his astonishing life story and reveals that most of us tap into only 40% of our capabilities.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1691796366i/41721428.jpg",
    publisher: "Lioncrest Publishing",
    publishedDate: "2018-12-04",
    pageCount: 364,
    isbn: "978-1544512280",
  },
  {
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    price: 499,
    discountPercent: 10,
    genre: "Classic Literature",
    desc: "Raskolnikov, an impoverished student in St. Petersburg, commits a murder and is subsequently plunged into a world of mental torment, guilt, and moral reckoning.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg",
    publisher: "Penguin Classics",
    publishedDate: "2003-01-30",
    pageCount: 671,
    isbn: "978-0140449136",
  },
  {
    title: "Into the Wild",
    author: "Jon Krakauer",
    price: 450,
    discountPercent: 15,
    genre: "Adventure",
    desc: "In April 1992 a young man from a well-to-do family hitchhiked to Alaska and walked alone into the wilderness north of Mt. McKinley. His name was Christopher Johnson McCandless.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634563880i/1845.jpg",
    publisher: "Villard",
    publishedDate: "1996-01-13",
    pageCount: 207,
    isbn: "978-0385486804",
  },
  {
    title: "Wherever You Go, There You Are",
    author: "Jon Kabat-Zinn",
    price: 420,
    discountPercent: 10,
    genre: "Mindfulness",
    desc: "Mindfulness Meditation in Everyday Life. Warmth, humor, and simplicity from the founder of Mindfulness-Based Stress Reduction.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348180928i/14096.jpg",
    publisher: "Hyperion",
    publishedDate: "1994-01-05",
    pageCount: 304,
    isbn: "978-1401307783",
  },
  {
    title: "Hamlet",
    author: "William Shakespeare",
    price: 299,
    discountPercent: 0,
    genre: "Drama",
    desc: "The Tragedy of Hamlet, Prince of Denmark, is Shakespeare's masterpiece probing betrayal, revenge, madness, and the human condition.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1351051308i/1420.jpg",
    publisher: "Simon & Schuster",
    publishedDate: "2003-07-01",
    pageCount: 342,
    isbn: "978-0743477123",
  },
  {
    title: "The Design of Everyday Things",
    author: "Don Norman",
    price: 650,
    discountPercent: 12,
    genre: "Art & Design",
    desc: "Even the smartest among us can feel inept as we fail to figure out which light switch or oven burner to turn on, or whether to push, pull, or slide a door. The cognitive psychology of design.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1442460745i/840.jpg",
    publisher: "Basic Books",
    publishedDate: "2013-11-05",
    pageCount: 368,
    isbn: "978-0465050659",
  },
  {
    title: "1984",
    author: "George Orwell",
    price: 399,
    discountPercent: 15,
    genre: "Fiction",
    desc: "Winston Smith toils for the Ministry of Truth in the totalitarian superstate of Oceania, where Big Brother watches every move and independent thought is punishable.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
    publisher: "Secker & Warburg",
    publishedDate: "1949-06-08",
    pageCount: 328,
    isbn: "978-0451524935",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 350,
    discountPercent: 10,
    genre: "Fiction",
    desc: "Santiago, an Andalusian shepherd boy, yearns to travel in search of a worldly treasure as extravagant as any ever found. The story of following your dreams and listening to your heart.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg",
    publisher: "HarperOne",
    publishedDate: "1993-04-25",
    pageCount: 197,
    isbn: "978-0062315007",
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    price: 420,
    discountPercent: 18,
    genre: "Sci-Fi",
    desc: "A futuristic World State of engineered citizens, conditioned social hierarchies, and psychological manipulation in a dystopian society.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1575509280i/5129.jpg",
    publisher: "Chatto & Windus",
    publishedDate: "1932-01-01",
    pageCount: 288,
    isbn: "978-0060850524",
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    price: 520,
    discountPercent: 15,
    genre: "Business",
    desc: "Notes on Startups, or How to Build the Future. The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg",
    publisher: "Crown Business",
    publishedDate: "2014-09-16",
    pageCount: 224,
    isbn: "978-0804139298",
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    price: 580,
    discountPercent: 20,
    genre: "Science",
    desc: "From the Big Bang to Black Holes, landmark volume in science writing by one of the greatest minds of our time exploring space, time, and the universe.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg",
    publisher: "Bantam Books",
    publishedDate: "1988-04-01",
    pageCount: 212,
    isbn: "978-0553380163",
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 360,
    discountPercent: 10,
    genre: "Classic Literature",
    desc: "The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan in the roaring twenties of Long Island.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
    publisher: "Scribner",
    publishedDate: "1925-04-10",
    pageCount: 180,
    isbn: "978-0743273565",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 450,
    discountPercent: 15,
    genre: "Classic Literature",
    desc: "Set in the fictional town of Maycomb, Alabama, the unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    publisher: "J. B. Lippincott & Co.",
    publishedDate: "1960-07-11",
    pageCount: 336,
    isbn: "978-0060935467",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 550,
    discountPercent: 20,
    genre: "Fantasy",
    desc: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life. But his contentment is disturbed when the wizard Gandalf and a company of thirteen dwarves arrive on his doorstep.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    publisher: "George Allen & Unwin",
    publishedDate: "1937-09-21",
    pageCount: 366,
    isbn: "978-0547928227",
  },
  {
    title: "Quiet: The Power of Introverts in a World That Can't Stop Talking",
    author: "Susan Cain",
    price: 499,
    discountPercent: 12,
    genre: "Psychology",
    desc: "At least one-third of the people we know are introverts. Susan Cain argues that we dramatically undervalue introverts and shows how much we lose in doing so.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328562861i/8520610.jpg",
    publisher: "Crown Publishing",
    publishedDate: "2012-01-24",
    pageCount: 352,
    isbn: "978-0307352156",
  },
  {
    title: "Grit: The Power of Passion and Perseverance",
    author: "Angela Duckworth",
    price: 480,
    discountPercent: 10,
    genre: "Personal Growth",
    desc: "Pioneering psychologist Angela Duckworth shows anyone striving to succeed that the secret to outstanding achievement is not talent but a special blend of passion and persistence.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1457889762i/27213329.jpg",
    publisher: "Scribner",
    publishedDate: "2016-05-03",
    pageCount: 352,
    isbn: "978-1501111105",
  },
  {
    title: "Freakonomics",
    author: "Steven D. Levitt, Stephen J. Dubner",
    price: 440,
    discountPercent: 15,
    genre: "Non-Fiction",
    desc: "A Rogue Economist Explores the Hidden Side of Everything. Which is more dangerous, a gun or a swimming pool? What do schoolteachers and sumo wrestlers have in common?",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327909092i/1202.jpg",
    publisher: "William Morrow",
    publishedDate: "2005-04-12",
    pageCount: 315,
    isbn: "978-0060731335",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 350,
    discountPercent: 0,
    genre: "Romance",
    desc: "The romantic clash between the opinionated Elizabeth Bennet and her proud beau, Mr. Darcy, is a splendid performance of civilized sparring.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327998810i/1885.jpg",
    publisher: "T. Egerton",
    publishedDate: "1813-01-28",
    pageCount: 279,
    isbn: "978-0141439518",
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 420,
    discountPercent: 10,
    genre: "Fiction",
    desc: "The hero-narrator of The Catcher in the Rye is an ancient sixteen-year-old, a native New Yorker named Holden Caulfield. Through his eyes we witness innocence and isolation.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
    publisher: "Little, Brown and Company",
    publishedDate: "1951-07-16",
    pageCount: 277,
    isbn: "978-0316769488",
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 590,
    discountPercent: 20,
    genre: "Business",
    desc: "How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses through rapid experimentation and validated learning.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1629999184i/10127019.jpg",
    publisher: "Crown Business",
    publishedDate: "2011-09-13",
    pageCount: 336,
    isbn: "978-0307887894",
  },
  {
    title: "Flow: The Psychology of Optimal Experience",
    author: "Mihaly Csikszentmihalyi",
    price: 520,
    discountPercent: 12,
    genre: "Psychology",
    desc: "Csikszentmihalyi's famous investigations of 'optimal experience' have revealed that what makes an experience genuinely satisfying is a state of consciousness called flow.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388185614i/66354.jpg",
    publisher: "Harper & Row",
    publishedDate: "1990-03-01",
    pageCount: 303,
    isbn: "978-0061339202",
  },
  {
    title: "Hyperion",
    author: "Dan Simmons",
    price: 680,
    discountPercent: 15,
    genre: "Sci-Fi",
    desc: "On the world called Hyperion, beyond the reach of galactic law, waits a creature called the Shrike. There are those who worship it. Those who fear it. And seven pilgrims traveling toward their destiny.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405546838i/77566.jpg",
    publisher: "Doubleday",
    publishedDate: "1989-05-26",
    pageCount: 482,
    isbn: "978-0553283686",
  },
  {
    title: "Snow Crash",
    author: "Neal Stephenson",
    price: 599,
    discountPercent: 15,
    genre: "Technology",
    desc: "In reality, Hiro Protagonist delivers pizza for Uncle Enzo's CosoNostra Pizza Inc. But in the Metaverse he's a warrior prince, plunging into an infocalypse conspiracy.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1589842551i/40651883.jpg",
    publisher: "Bantam Spectra",
    publishedDate: "1992-06-01",
    pageCount: 440,
    isbn: "978-0553380958",
  },
  {
    title: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    price: 640,
    discountPercent: 18,
    genre: "Psychology",
    desc: "Brain, Mind, and Body in the Healing of Trauma. Trauma is a fact of life. Dr. Bessel van der Kolk transforms our understanding of traumatic stress using recent scientific advances.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655075677i/18693763.jpg",
    publisher: "Viking",
    publishedDate: "2014-09-25",
    pageCount: 464,
    isbn: "978-0143127741",
  },
  {
    title: "Educated",
    author: "Tara Westover",
    price: 510,
    discountPercent: 10,
    genre: "Biography",
    desc: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
    publisher: "Random House",
    publishedDate: "2018-02-20",
    pageCount: 334,
    isbn: "978-0399590504",
  },
  {
    title: "When Breath Becomes Air",
    author: "Paul Kalanithi",
    price: 490,
    discountPercent: 15,
    genre: "Biography",
    desc: "At the age of thirty-six, on the verge of completing a decade's worth of training as a neurosurgeon, Paul Kalanithi was diagnosed with stage IV lung cancer. A profound reflection on facing mortality.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1492677644i/25821931.jpg",
    publisher: "Random House",
    publishedDate: "2016-01-12",
    pageCount: 208,
    isbn: "978-0812988406",
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    price: 480,
    discountPercent: 20,
    genre: "Fiction",
    desc: "A father and his son walk alone through burned America. Nothing moves in the ravaged landscape save the ash on the wind. An unflinching, luminous meditation on love and survival.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1600241424i/6288.jpg",
    publisher: "Alfred A. Knopf",
    publishedDate: "2006-09-26",
    pageCount: 287,
    isbn: "978-0307387899",
  },
  {
    title: "Good to Great",
    author: "Jim Collins",
    price: 650,
    discountPercent: 10,
    genre: "Business",
    desc: "Why Some Companies Make the Leap... and Others Don't. Study of companies that made the transition from average performance to enduring greatness.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546097703i/17255186.jpg",
    publisher: "HarperBusiness",
    publishedDate: "2001-10-16",
    pageCount: 300,
    isbn: "978-0066620992",
  },
  {
    title: "The Master and Margarita",
    author: "Mikhail Bulgakov",
    price: 499,
    discountPercent: 12,
    genre: "Classic Literature",
    desc: "The Devil, disguised as the enigmatic Professor Woland, arrives in 1930s Soviet Moscow accompanied by a mischievous entourage including a giant talking cat.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327867963i/117833.jpg",
    publisher: "Penguin Classics",
    publishedDate: "1967-01-01",
    pageCount: 412,
    isbn: "978-0141180144",
  },
  {
    title: "A Gentleman in Moscow",
    author: "Amor Towles",
    price: 540,
    discountPercent: 15,
    genre: "Fiction",
    desc: "In 1922, Count Alexander Rostov is sentenced to spend the remainder of his life inside the luxurious Hotel Metropol across the street from the Kremlin.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1459524472i/29430012.jpg",
    publisher: "Viking",
    publishedDate: "2016-09-06",
    pageCount: 462,
    isbn: "978-0735221079",
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    price: 460,
    discountPercent: 10,
    genre: "Sci-Fi",
    desc: "Case was the sharpest data-thief in the matrix until he crossed the wrong people. Now a mysterious employer recruits him for a high-risk cyberspace run against an unearthly AI.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554437249i/6088007.jpg",
    publisher: "Ace Books",
    publishedDate: "1984-07-01",
    pageCount: 271,
    isbn: "978-0441569595",
  },
  {
    title: "Waking Up: A Guide to Spirituality Without Religion",
    author: "Sam Harris",
    price: 480,
    discountPercent: 15,
    genre: "Spirituality",
    desc: "Neuroscientist and philosopher Sam Harris explores consciousness, meditation, and how to practice mindfulness grounded in reason and modern science.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1400870940i/18774981.jpg",
    publisher: "Simon & Schuster",
    publishedDate: "2014-09-09",
    pageCount: 256,
    isbn: "978-1451636024",
  },
  {
    title: "The Metamorphosis",
    author: "Franz Kafka",
    price: 299,
    discountPercent: 0,
    genre: "Philosophy",
    desc: "Gregor Samsa wakes one morning from uneasy dreams to find himself transformed in his bed into a monstrous vermin. Kafka's iconic exploration of alienation.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1646444605i/485894.jpg",
    publisher: "Kurt Wolff Verlag",
    publishedDate: "1915-10-01",
    pageCount: 201,
    isbn: "978-0553213690",
  },
  {
    title: "Normal People",
    author: "Sally Rooney",
    price: 480,
    discountPercent: 18,
    genre: "Fiction",
    desc: "Connell and Marianne grow up in the same small town in rural Ireland. As they move to university in Dublin, their intricate connection weaves through youth, vulnerability, and love.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1571423190i/41057294.jpg",
    publisher: "Faber & Faber",
    publishedDate: "2018-08-28",
    pageCount: 273,
    isbn: "978-1984822178",
  },
  {
    title: "The Code Breaker",
    author: "Walter Isaacson",
    price: 799,
    discountPercent: 20,
    genre: "Science",
    desc: "Jennifer Doudna, Gene Editing, and the Future of the Human Race. How CRISPR will allow us to cure diseases, fend off viruses, and have healthier babies.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603726588i/54968118.jpg",
    publisher: "Simon & Schuster",
    publishedDate: "2021-03-09",
    pageCount: 560,
    isbn: "978-1982115852",
  },
  {
    title: "Slaughterhouse-Five",
    author: "Kurt Vonnegut",
    price: 450,
    discountPercent: 12,
    genre: "Classic Literature",
    desc: "Billy Pilgrim travels back and forth in time from his experiences as an American prisoner of war witnessing the firebombing of Dresden to the planet Tralfamadore.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1440319389i/4981.jpg",
    publisher: "Delacorte",
    publishedDate: "1969-03-31",
    pageCount: 275,
    isbn: "978-0385333849",
  },
  {
    title: "The Innovators",
    author: "Walter Isaacson",
    price: 750,
    discountPercent: 15,
    genre: "Technology",
    desc: "How a Group of Hackers, Geniuses, and Geeks Created the Digital Revolution, beginning with Ada Lovelace and spanning Turing, Von Neumann, Gates, and Jobs.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1402324905i/21856367.jpg",
    publisher: "Simon & Schuster",
    publishedDate: "2014-10-07",
    pageCount: 560,
    isbn: "978-1476708690",
  },
  {
    title: "Rework",
    author: "Jason Fried, David Heinemeier Hansson",
    price: 499,
    discountPercent: 10,
    genre: "Business",
    desc: "A better, faster, easier way to succeed in business. Most business books give you the same old advice. Rework shows you that you need less than you think.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391275636i/6732019.jpg",
    publisher: "Crown Business",
    publishedDate: "2010-03-09",
    pageCount: 288,
    isbn: "978-0307463746",
  },
  {
    title: "Milk and Honey",
    author: "Rupi Kaur",
    price: 360,
    discountPercent: 0,
    genre: "Poetry",
    desc: "A collection of poetry and prose about survival, experience of violence, abuse, love, loss, and femininity, split into four chapters dealing with a different pain.",
    language: "English",
    url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1491595510i/23513349.jpg",
    publisher: "Andrews McMeel",
    publishedDate: "2015-10-06",
    pageCount: 208,
    isbn: "978-1449474256",
  },
];

const REAL_USERS_DATA = [
  { username: "AaravSharma", email: "aarav.sharma@example.com", bio: "Tech entrepreneur and speculative sci-fi fanatic. Reading to explore futures.", favoriteGenres: ["Sci-Fi", "Technology", "Business"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { username: "ElenaRostova", email: "elena.rostova@example.com", bio: "Literature professor & tea enthusiast. Deeply passionate about 19th-century classics.", favoriteGenres: ["Classic Literature", "Philosophy", "History"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { username: "MarcusVance", email: "marcus.vance@example.com", bio: "Product designer fascinated by behavioral psychology and cognitive science.", favoriteGenres: ["Psychology", "Art & Design", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { username: "PriyaMenon", email: "priya.menon@example.com", bio: "Mindfulness practitioner, yogi & lover of contemporary fiction.", favoriteGenres: ["Mindfulness", "Spirituality", "Fiction"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { username: "OliverBennett", email: "oliver.bennett@example.com", bio: "History researcher & biographer. On a quest to read 50 memoirs this year.", favoriteGenres: ["Biography", "History", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { username: "AnanyaVerma", email: "ananya.verma@example.com", bio: "Curious student exploring philosophy, neuroscience & poetry.", favoriteGenres: ["Philosophy", "Science", "Poetry"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "LiamDavies", email: "liam.davies@example.com", bio: "Fantasy writer building intricate magic systems. Currently devouring epic sagas.", favoriteGenres: ["Fantasy", "Adventure", "Fiction"], avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80" },
  { username: "KavitaRao", email: "kavita.rao@example.com", bio: "Environmental scientist reading about ecosystems, climate & cosmos.", favoriteGenres: ["Science", "Non-Fiction", "Adventure"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { username: "LucasMoreau", email: "lucas.moreau@example.com", bio: "Parisian architect studying spatial design, urban histories & classic drama.", favoriteGenres: ["Art & Design", "Drama", "History"], avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" },
  { username: "RohanMehta", email: "rohan.mehta@example.com", bio: "Venture capitalist & habit builder. Always looking for mental models.", favoriteGenres: ["Business", "Self-Help", "Personal Growth"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { username: "ChloeDubois", email: "chloe.dubois@example.com", bio: "Poet and translator searching for rhythm in human storytelling.", favoriteGenres: ["Poetry", "Romance", "Drama"], avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { username: "VikramSeth", email: "vikram.seth99@example.com", bio: "Civil engineer who spends weekends lost in high fantasy and historical battles.", favoriteGenres: ["Fantasy", "History", "Sci-Fi"], avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { username: "SophiaChen", email: "sophia.chen@example.com", bio: "AI researcher curious about cognitive psychology and human-machine futures.", favoriteGenres: ["Technology", "Psychology", "Science"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { username: "NeilGrover", email: "neil.grover@example.com", bio: "Detective fiction addict and puzzle solver. If there's a plot twist, I want it.", favoriteGenres: ["Thriller", "Mystery", "Fiction"], avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80" },
  { username: "MayaLin", email: "maya.lin@example.com", bio: "Landscape painter finding stillness in Stoic texts and eastern thought.", favoriteGenres: ["Spirituality", "Philosophy", "Art & Design"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "DevPatel", email: "dev.patel@example.com", bio: "Full-stack developer building open source apps. Reads late into the night.", favoriteGenres: ["Technology", "Business", "Sci-Fi"], avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80" },
  { username: "HannahSchmidt", email: "hannah.schmidt@example.com", bio: "Berlin-based journalist covering European geopolitics and social revolutions.", favoriteGenres: ["History", "Non-Fiction", "Biography"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { username: "AdityaKapoor", email: "aditya.kapoor@example.com", bio: "Fitness coach & biohacker believing in physical and mental mastery.", favoriteGenres: ["Personal Growth", "Self-Help", "Psychology"], avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80" },
  { username: "AmaraOkonjo", email: "amara.okonjo@example.com", bio: "Economist exploring global development, trade routes, and social philosophy.", favoriteGenres: ["Business", "Non-Fiction", "Philosophy"], avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" },
  { username: "SamirKhan", email: "samir.khan@example.com", bio: "Astronomer gazing at stars and reading vintage science fiction.", favoriteGenres: ["Science", "Sci-Fi", "Adventure"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { username: "ZoeKowalski", email: "zoe.kowalski@example.com", bio: "Neurodivergent artist finding solace in graphic memoirs and emotional fiction.", favoriteGenres: ["Fiction", "Art & Design", "Psychology"], avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { username: "IshaanChopra", email: "ishaan.chopra@example.com", bio: "Startup founder obsessed with productivity hacks and deep work.", favoriteGenres: ["Business", "Personal Growth", "Technology"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { username: "FatimaAlZahra", email: "fatima.alzahra@example.com", bio: "Linguist and historical romance aficionado. Reading across 4 languages.", favoriteGenres: ["Romance", "History", "Poetry"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { username: "MateoGarcia", email: "mateo.garcia@example.com", bio: "Chef & culinary traveler collecting stories from every corner of the world.", favoriteGenres: ["Adventure", "Biography", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" },
  { username: "TaraIyer", email: "tara.iyer@example.com", bio: "Classical vocalist inspired by ancient mythology and epic poetry.", favoriteGenres: ["Classic Literature", "Poetry", "Spirituality"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "JulianVogel", email: "julian.vogel@example.com", bio: "Software architect fascinated by cybernetics, encryption and dystopian lore.", favoriteGenres: ["Technology", "Sci-Fi", "Philosophy"], avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { username: "NandiniNair", email: "nandini.nair@example.com", bio: "Psychiatrist reading about human resilience, trauma recovery & healing.", favoriteGenres: ["Psychology", "Mindfulness", "Self-Help"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { username: "EthanWright", email: "ethan.wright@example.com", bio: "Mountain climber and wilderness photographer. Addicted to survival memoirs.", favoriteGenres: ["Adventure", "Biography", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { username: "SimranBhatia", email: "simran.bhatia@example.com", bio: "Law student analyzing political theory, ethics, and criminal psychology.", favoriteGenres: ["Philosophy", "Thriller", "History"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { username: "AlexanderCole", email: "alexander.cole@example.com", bio: "Financial analyst & book collector. Looking for overlooked modern classics.", favoriteGenres: ["Business", "Classic Literature", "Fiction"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { username: "MeeraNambiar", email: "meera.nambiar@example.com", bio: "Graphic novelist and animator. Living for rich visual worldbuilding.", favoriteGenres: ["Fantasy", "Art & Design", "Sci-Fi"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { username: "GabrielSilva", email: "gabriel.silva@example.com", bio: "Brazilian jazz pianist reading poetry and magical realism.", favoriteGenres: ["Poetry", "Fiction", "Drama"], avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80" },
  { username: "RheaKulkarni", email: "rhea.kulkarni@example.com", bio: "UX researcher & cognitive design advocate. Obsessed with Don Norman and Kahneman.", favoriteGenres: ["Art & Design", "Psychology", "Technology"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { username: "NoahSterling", email: "noah.sterling@example.com", bio: "Astrophysics student tracking exoplanets and cosmic evolution.", favoriteGenres: ["Science", "Sci-Fi", "Philosophy"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { username: "AishaQureshi", email: "aisha.qureshi@example.com", bio: "Pediatrician and avid reader of cozy fiction and personal growth.", favoriteGenres: ["Fiction", "Self-Help", "Personal Growth"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "DanielKim", email: "daniel.kim@example.com", bio: "Robotics engineer building autonomous drones and reading hard sci-fi.", favoriteGenres: ["Technology", "Sci-Fi", "Science"], avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80" },
  { username: "SnehaReddy", email: "sneha.reddy@example.com", bio: "Biotech researcher passionate about CRISPR, genetics & human evolution.", favoriteGenres: ["Science", "Non-Fiction", "Biography"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { username: "ArthurPendleton", email: "arthur.pendleton@example.com", bio: "Antique book restorer & medieval history enthusiast.", favoriteGenres: ["History", "Classic Literature", "Philosophy"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { username: "NatashaVolkova", email: "natasha.volkova@example.com", bio: "Chess master and lover of psychological thrillers and Dostoyevsky.", favoriteGenres: ["Thriller", "Psychology", "Classic Literature"], avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { username: "KarthikSundaram", email: "karthik.sundaram@example.com", bio: "Management consultant exploring organizational psychology and leadership.", favoriteGenres: ["Business", "Self-Help", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { username: "IsabellaRossi", email: "isabella.rossi@example.com", bio: "Art historian and curator in Florence exploring renaissance masterpieces.", favoriteGenres: ["Art & Design", "History", "Biography"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { username: "KabirBakshi", email: "kabir.bakshi@example.com", bio: "Documentary filmmaker documenting indie writers and forgotten bookstore gems.", favoriteGenres: ["Adventure", "Fiction", "Drama"], avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80" },
  { username: "FrejaLund", email: "freja.lund@example.com", bio: "Nordic noir fan and investigative crime podcast creator.", favoriteGenres: ["Thriller", "Mystery", "Psychology"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { username: "ArjunSaxena", email: "arjun.saxena@example.com", bio: "Stoic student and marathon runner. Everyday is a chance to grow.", favoriteGenres: ["Philosophy", "Personal Growth", "Self-Help"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { username: "YukiTanaka", email: "yuki.tanaka@example.com", bio: "Game director and interactive storytelling enthusiast in Tokyo.", favoriteGenres: ["Sci-Fi", "Fantasy", "Art & Design"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { username: "TanviDeshmukh", email: "tanvi.deshmukh@example.com", bio: "Content strategist & book club host loving tender character arcs.", favoriteGenres: ["Fiction", "Romance", "Poetry"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { username: "CalebFoster", email: "caleb.foster@example.com", bio: "Biohacker and extreme sports athlete exploring human endurance limits.", favoriteGenres: ["Personal Growth", "Adventure", "Science"], avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80" },
  { username: "ZainabMirza", email: "zainab.mirza@example.com", bio: "Poetry editor and essayist reflecting on heritage, displacement, and love.", favoriteGenres: ["Poetry", "Spirituality", "Drama"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "RishiSinghal", email: "rishi.singhal@example.com", bio: "Data engineer reading philosophy of mind and distributed computing.", favoriteGenres: ["Technology", "Philosophy", "Non-Fiction"], avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80" },
  { username: "ClaraMendoza", email: "clara.mendoza@example.com", bio: "Botanist and nature writer seeking serenity between pages.", favoriteGenres: ["Mindfulness", "Science", "Adventure"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { username: "VarunGoswami", email: "varun.goswami@example.com", bio: "Cybersecurity analyst & privacy advocate reading cryptic sci-fi.", favoriteGenres: ["Technology", "Sci-Fi", "Thriller"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { username: "SiddharthMalhotra", email: "siddharth.m@example.com", bio: "Investment banker & habit tracker exploring behavioral economics.", favoriteGenres: ["Business", "Psychology", "Self-Help"], avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
  { username: "LeilaHaddad", email: "leila.haddad@example.com", bio: "Architect exploring Mediterranean heritage and contemplative design.", favoriteGenres: ["Art & Design", "History", "Philosophy"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { username: "ManishDubey", email: "manish.dubey@example.com", bio: "High school physics teacher spreading wonder for the cosmos.", favoriteGenres: ["Science", "Non-Fiction", "Biography"], avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80" },
  { username: "EmmaWatson", email: "emma.watson.reader@example.com", bio: "Advocate for literature, feminist classics and independent thought.", favoriteGenres: ["Classic Literature", "Fiction", "Philosophy"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { username: "TariqMansoor", email: "tariq.mansoor@example.com", bio: "Urban planner fascinated by world cities, geography & history.", favoriteGenres: ["History", "Non-Fiction", "Art & Design"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { username: "DivyaPillai", email: "divya.pillai@example.com", bio: "Social worker reading human memoirs and mindfulness reflections.", favoriteGenres: ["Mindfulness", "Biography", "Self-Help"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { username: "LeonBoucher", email: "leon.boucher@example.com", bio: "Philosopher researching existentialism, stoicism & epistemology.", favoriteGenres: ["Philosophy", "Classic Literature", "Drama"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { username: "ShrutiBansal", email: "shruti.bansal@example.com", bio: "Brand designer who loves poetry, minimalism and coffee.", favoriteGenres: ["Poetry", "Art & Design", "Fiction"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { username: "BenjaminCruz", email: "benjamin.cruz@example.com", bio: "Ecologist studying ancient rainforests and deep geological time.", favoriteGenres: ["Adventure", "Science", "History"], avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80" },
];

const DISCUSSIONS_DATA = [
  {
    title: "What book completely altered your worldview or daily habits?",
    content: "For me, reading 'Atomic Habits' by James Clear made me realize how tiny 1% daily changes compound exponentially over years. Instead of relying on willpower, restructuring my physical environment solved 90% of my distractions. What single book created that watershed paradigm shift for you?",
  },
  {
    title: "Why Marcus Aurelius' Meditations remains the ultimate guide to mental resilience",
    content: "Writing notes to himself on battlefields in 170 AD, the Roman Emperor didn't write for public acclaim. His core insight—that we cannot control external events, only our inner interpretation—is unmatched. How do you integrate Stoic contemplation into modern chaotic lifestyles?",
  },
  {
    title: "Deep Work vs Continuous Connectivity: Is solitude our rarest asset?",
    content: "Cal Newport argues that deep, uninterrupted concentration is becoming simultaneously rarer and significantly more valuable in our economy. How many hours of true deep work do you manage to carve out each week without checking Slack or phone notifications?",
  },
  {
    title: "Dune vs Hyperion: Which worldbuilding reigns supreme in Sci-Fi?",
    content: "Both Frank Herbert and Dan Simmons constructed monumental universes rich with religion, ecology, and political intrigue. What makes Arrakis or the Shrike pilgrimage resonate so deeply across generations of speculative fiction lovers?",
  },
  {
    title: "The psychology behind 'The Silent Patient' and unforgettable plot twists",
    content: "Alex Michaelides structured Alicia's silence and Theo's psychoanalytic investigation with remarkable precision. What other psychological thrillers left you staring at the final page in complete disbelief?",
  },
  {
    title: "Physical Paper Books vs E-readers: Which connects deeper to your memory?",
    content: "Studies suggest tactile sensory feedback—page texture, spatial layout, turning pages—enhances cognitive mapping and retention. Do you prefer the sensory weight of hardcovers or the portability of digital readers?",
  },
  {
    title: "Reflections on Sapiens: The power of shared fictional myths",
    content: "Harari's thesis that Homo sapiens conquered the globe because of our unique capacity to believe in shared collective fictions (money, corporations, nations, human rights) is captivating. Which chapter provoked you the most?",
  },
  {
    title: "How to build a sustainable daily reading habit without burning out",
    content: "The easiest trap is setting aggressive goals like '50 pages a day' and giving up when life gets busy. Committing to a non-negotiable 15 minutes before bed or first thing with morning coffee transformed my consistency. What's your reading routine?",
  },
  {
    title: "The profound sorrow and beauty in 'When Breath Becomes Air'",
    content: "Paul Kalanithi's memoir captures the transition from treating dying patients to becoming the patient facing mortality. It reminds us that time is finite and meaning is forged through love and deliberate purpose.",
  },
  {
    title: "Is Artificial Intelligence in 'Klara and the Sun' closer than we think?",
    content: "Kazuo Ishiguro wrote Klara's perspective with such tender innocence and deep observational curiosity. With modern LLMs advancing rapidly, how do you see the boundary between artificial observation and true empathy evolving?",
  },
  {
    title: "Top 3 books every aspiring entrepreneur should read before launching",
    content: "If you had to recommend a foundational triumvirate for company builders, what would you choose? My picks: The Lean Startup, Zero to One, and The Psychology of Money.",
  },
  {
    title: "The poetic imagery of Emily Dickinson in moments of solitude",
    content: "Dickinson understood the vast cosmos existing within the quiet room. Her poem 'Hope is the thing with feathers' has carried generations through darkest winters.",
  },
  {
    title: "What makes Dostoevsky's 'Crime and Punishment' psychological genius?",
    content: "The psychological torment of Raskolnikov begins long before the crime and spirals into a fever dream of guilt, redemption, and spiritual awakening. Why does Dostoevsky understand human darkness so intimately?",
  },
  {
    title: "Best books on mindfulness and presence for high-stress careers",
    content: "Looking for recommendations on staying centered during high-stakes deadlines. 'The Power of Now' and 'Wherever You Go, There You Are' helped me immensely. Any other modern guides you swear by?",
  },
];

const CLUBS_DATA = [
  {
    name: "The Midnight Philosophy Society",
    description: "A sanctuary for contemplative minds exploring Stoicism, Existentialism, Eastern Philosophy, and ethics in modern society.",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Deep Tech & Sci-Fi Thinkers",
    description: "Reading cutting-edge speculative fiction, cybernetics, artificial intelligence, and cosmos worldbuilding.",
    coverImage: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mindful Living & Growth Circle",
    description: "Dedicated to habit building, cognitive mastery, emotional resilience, and intentional living.",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Classic Literature Guild",
    description: "Exploring timeless literary masterpieces from Tolstoy, Dostoevsky, Shakespeare, Austen, and the Bronte sisters.",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Page Turners Thriller Club",
    description: "Unraveling psychological twists, locked-room mysteries, detective noirs, and heart-pounding suspense novels.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
  },
];

const REACTION_POOL = [
  "Mind-Blowing",
  "Inspiring",
  "Deep & Thought-Provoking",
  "Page-Turner",
  "Emotional & Moving",
  "Life-Changing",
  "Beautiful Prose",
  "Unforgettable",
];

const SAMPLE_REVIEWS = [
  "An extraordinary book that completely reshaped how I think about everyday routines. Highly recommended!",
  "Brilliant prose, deeply moving character arcs, and unforgettable insights. Finished it in two sittings.",
  "A masterpiece of its genre. The depth of research and clarity of storytelling is second to none.",
  "Challenging, provocative, and immensely rewarding. I will be revisiting these pages for years to come.",
  "Simple, elegant, and packed with practical wisdom that you can apply immediately.",
  "A breathtaking journey. Left me contemplating human nature long after turning the final page.",
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.URI);
    console.log("Connected successfully!");

    // 1. Seed Books
    console.log(`\n--- Seeding Books (${BOOKS_DATA.length}) ---`);
    const seededBooks = [];
    for (const bData of BOOKS_DATA) {
      let existing = await Book.findOne({ title: bData.title });
      if (!existing) {
        existing = await Book.create(bData);
        console.log(`+ Created book: ${bData.title}`);
      } else {
        // Update fields if needed
        existing.url = bData.url;
        existing.price = bData.price;
        existing.discountPercent = bData.discountPercent;
        existing.genre = bData.genre;
        existing.pageCount = bData.pageCount;
        existing.publisher = bData.publisher;
        existing.desc = bData.desc;
        await existing.save();
        console.log(`= Updated book: ${bData.title}`);
      }
      seededBooks.push(existing);
    }

    // 2. Seed Users
    console.log(`\n--- Seeding Users (${REAL_USERS_DATA.length}) ---`);
    const hashedPassword = await bcrypt.hash("password123", 10);
    const seededUsers = [];

    for (const uData of REAL_USERS_DATA) {
      let existing = await User.findOne({ username: uData.username });
      if (!existing) {
        existing = await User.create({
          username: uData.username,
          email: uData.email,
          password: hashedPassword,
          address: "221B Baker Street, London / 42 Elm Street, New Delhi",
          avatar: uData.avatar,
          bio: uData.bio,
          favoriteGenres: uData.favoriteGenres,
          role: "user",
          privacy: { isPublic: true },
          readingGoal: { year: 2026, targetBooks: 24 },
        });
        console.log(`+ Created user: ${uData.username}`);
      } else {
        existing.bio = uData.bio;
        existing.avatar = uData.avatar;
        existing.favoriteGenres = uData.favoriteGenres;
        existing.privacy = { isPublic: true };
        await existing.save();
        console.log(`= Updated user: ${uData.username}`);
      }
      seededUsers.push(existing);
    }

    // 3. Connect Following/Followers & Libraries to create real overlap
    console.log("\n--- Creating Interconnected Social Network & Library Overlaps ---");
    for (let i = 0; i < seededUsers.length; i++) {
      const user = seededUsers[i];
      const otherUsers = seededUsers.filter((u) => String(u._id) !== String(user._id));

      // Follow 3-6 random fellow readers
      const numFollow = Math.min(otherUsers.length, Math.floor(Math.random() * 4) + 3);
      const shuffledOthers = [...otherUsers].sort(() => 0.5 - Math.random());
      const toFollow = shuffledOthers.slice(0, numFollow);

      user.following = toFollow.map((u) => u._id);
      await user.save();

      for (const target of toFollow) {
        if (!target.followers.some((f) => String(f) === String(user._id))) {
          target.followers.push(user._id);
          await target.save();
        }
      }

      // Add 4-8 books to user's library and favourites
      const numBooks = Math.floor(Math.random() * 5) + 4;
      const shuffledBooks = [...seededBooks].sort(() => 0.5 - Math.random());
      const userSelectedBooks = shuffledBooks.slice(0, numBooks);

      user.favourites = userSelectedBooks.slice(0, 3).map((b) => b._id);
      await user.save();

      for (let j = 0; j < userSelectedBooks.length; j++) {
        const book = userSelectedBooks[j];
        const status = j === 0 ? "CURRENTLY_READING" : j === 1 ? "WANT_TO_READ" : "FINISHED";
        const pageLimit = book.pageCount || 300;
        const curPage = status === "FINISHED" ? pageLimit : status === "CURRENTLY_READING" ? Math.floor(pageLimit * 0.45) : 0;
        const progress = Math.round((curPage / pageLimit) * 100);

        await UserBook.findOneAndUpdate(
          { user: user._id, book: book._id },
          {
            user: user._id,
            book: book._id,
            status,
            currentPage: curPage,
            progressPercentage: progress,
            rating: status === "FINISHED" ? Math.floor(Math.random() * 2) + 4 : undefined,
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Seed Reviews & Reactions
    console.log("\n--- Seeding Book Reviews & Reactions ---");
    for (const book of seededBooks.slice(0, 30)) {
      const reviewerCount = Math.floor(Math.random() * 4) + 2;
      const shuffledUsers = [...seededUsers].sort(() => 0.5 - Math.random());

      for (let k = 0; k < reviewerCount; k++) {
        const revUser = shuffledUsers[k];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const text = SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)];
        const reactions = [
          REACTION_POOL[Math.floor(Math.random() * REACTION_POOL.length)],
          REACTION_POOL[Math.floor(Math.random() * REACTION_POOL.length)],
        ];

        await Review.findOneAndUpdate(
          { user: revUser._id, book: book._id },
          {
            user: revUser._id,
            book: book._id,
            rating,
            text,
            reactions: Array.from(new Set(reactions)),
          },
          { upsert: true, new: true }
        );
      }
    }

    // 5. Seed Discussions & Comments
    console.log(`\n--- Seeding Community Discussions (${DISCUSSIONS_DATA.length}) ---`);
    for (let i = 0; i < DISCUSSIONS_DATA.length; i++) {
      const dData = DISCUSSIONS_DATA[i];
      const author = seededUsers[i % seededUsers.length];
      const relatedBook = seededBooks[i % seededBooks.length];

      let discussion = await Discussion.findOne({ title: dData.title });
      if (!discussion) {
        discussion = await Discussion.create({
          title: dData.title,
          content: dData.content,
          author: author._id,
          book: relatedBook._id,
          likes: seededUsers.slice(0, Math.floor(Math.random() * 8) + 3).map((u) => u._id),
        });
        console.log(`+ Created discussion: "${dData.title.slice(0, 40)}..."`);
      }

      // Add 2-4 comments per discussion
      const commentAuthors = [...seededUsers].sort(() => 0.5 - Math.random()).slice(0, 3);
      for (const cAuthor of commentAuthors) {
        const existingComment = await Comment.findOne({
          discussion: discussion._id,
          author: cAuthor._id,
        });
        if (!existingComment) {
          await Comment.create({
            discussion: discussion._id,
            author: cAuthor._id,
            text: `Such a thoughtful perspective! Especially how you framed the impact of ${relatedBook.title}. Completely agree with this reflection.`,
            likes: [author._id],
          });
        }
      }
    }

    // 6. Seed Book Clubs
    console.log(`\n--- Seeding Book Clubs (${CLUBS_DATA.length}) ---`);
    for (let i = 0; i < CLUBS_DATA.length; i++) {
      const cData = CLUBS_DATA[i];
      const creator = seededUsers[i];
      const currentBook = seededBooks[i * 4];
      const members = seededUsers.slice(0, 15).map((u) => u._id);

      let club = await BookClub.findOne({ name: cData.name });
      if (!club) {
        club = await BookClub.create({
          name: cData.name,
          description: cData.description,
          creator: creator._id,
          currentBook: currentBook._id,
          members,
          coverImage: cData.coverImage,
        });
        console.log(`+ Created book club: ${cData.name}`);
      } else {
        club.currentBook = currentBook._id;
        club.members = members;
        await club.save();
      }
    }

    // 7. Seed Orders
    console.log("\n--- Seeding User Orders ---");
    const statuses = ["Delivered", "Out for delivery", "Order placed", "Delivered", "Delivered"];
    for (let i = 0; i < 45; i++) {
      const user = seededUsers[i % seededUsers.length];
      const book = seededBooks[i % seededBooks.length];
      const status = statuses[i % statuses.length];

      const existingOrder = await Order.findOne({ user: user._id, book: book._id });
      if (!existingOrder) {
        const ord = await Order.create({
          user: user._id,
          book: book._id,
          status,
        });
        await User.findByIdAndUpdate(user._id, { $addToSet: { orders: ord._id } });
      }
    }

    console.log("\n✅ Database successfully populated with realistic books, readers, discussions, clubs, reviews, and orders!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
