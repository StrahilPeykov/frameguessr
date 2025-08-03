// Run this script to seed the database with initial daily movies
// Usage: npx tsx scripts/seed-daily-movies.ts
// This script will SKIP existing dates to protect your handpicked data
// Now supports manual image URLs and Deezer track IDs

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Popular movies and TV shows with manual image URLs and Deezer track IDs
interface SeedMovie { 
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year: number
  /**
   * Optional TMDB image path (without the base URL).
   * Example: "nkmtCLg6afpSfdQcyNs2jemfSLR.jpg"
   * Will be converted to: "https://image.tmdb.org/t/p/original/nkmtCLg6afpSfdQcyNs2jemfSLR.jpg"
   * If not provided, will use empty string
   */
  imagePath?: string
  /**
   * Optional Deezer track ID for audio hint.
   * If not provided, will be set to null
   */
  deezerTrackId?: number
}

const SEED_MOVIES: SeedMovie[] = [
  { tmdb_id: 244786, media_type: 'movie', title: 'Whiplash', year: 2014, imagePath: 'nkmtCLg6afpSfdQcyNs2jemfSLR.jpg', deezerTrackId: 1398706592 },
  { tmdb_id: 181808, media_type: 'movie', title: 'Star Wars: The Rise of Skywalker', year: 2019, imagePath: 'xkmmfNjzU4xszd0K5M6olKeDDLU.jpg', deezerTrackId: 831930892 },
  { tmdb_id: 49026,  media_type: 'movie', title: 'The Dark Knight Rises', year: 2012, imagePath: 'zRO9qGmu3dB5vqpwmSzhJN8IHzR.jpg', deezerTrackId: 647709132 },
  { tmdb_id: 1399,   media_type: 'tv',    title: 'Game of Thrones', year: 2011, imagePath: 'uOyzabKQJdrXL4X5a2uecWdHEG1.jpg', deezerTrackId: 681291502 },
  { tmdb_id: 603,    media_type: 'movie', title: 'The Matrix', year: 1999, imagePath: 'oCkOhekO65sH5o3UnnWPStYHEnv.jpg', deezerTrackId: 119871440 },
  { tmdb_id: 11,     media_type: 'movie', title: 'Star Wars: Episode IV - A New Hope', year: 1977, imagePath: '4qCqAdHcNKeAHcK8tJ8wNJZa9cx.jpg', deezerTrackId: 493886962 },
  { tmdb_id: 475557, media_type: 'movie', title: 'Joker', year: 2019, imagePath: 'e89BFT5P8baD1lE6RqljYCa76Ms.jpg', deezerTrackId: 767121772 },
  { tmdb_id: 1891,   media_type: 'movie', title: 'The Empire Strikes Back', year: 1980, imagePath: 'mHqT2YbPHcVtuZIIi8KrbZiLPKp.jpg', deezerTrackId: 493841982 },
  { tmdb_id: 1726,   media_type: 'movie', title: 'Iron Man', year: 2008, imagePath: 'raL07Akg9iTNejmT9X6atebdLBD.jpg', deezerTrackId: 2043656967 },
  { tmdb_id: 280,    media_type: 'movie', title: 'Terminator 2: Judgment Day', year: 1991, imagePath: 'i5megxGRBadEZEUeej5ADFnYLlB.jpg', deezerTrackId: 142745594 },
  { tmdb_id: 246,    media_type: 'tv',    title: 'Avatar: The Last Airbender', year: 2005, imagePath: '41eUFDjNA7KMcCQJ9Vw3OkCUWYz.jpg', deezerTrackId: 2536848081 },
  { tmdb_id: 94605,  media_type: 'tv',    title: 'Arcane', year: 2021, imagePath: 'cJ0vEnEGWZDv2a5SRRRGxtRTlPm.jpg', deezerTrackId: 2817563382 },
  { tmdb_id: 607,    media_type: 'movie', title: 'Men in Black', year: 1997, imagePath: 'hGGzI2XJ1q0JkLDo4iWprfjxaGi.jpg', deezerTrackId: 13147190 },
  { tmdb_id: 1396,   media_type: 'tv',    title: 'Breaking Bad', year: 2008, imagePath: 'b7KQfZDUgmSNMqAq4KgtIU7neKh.jpg', deezerTrackId: 69838319 },
  { tmdb_id: 1408,   media_type: 'tv',    title: 'House', year: 2004, imagePath: 'x4nI488jqpVIZPpHxt8RWYzAjZW.jpg', deezerTrackId: 3129748 },
  { tmdb_id: 671,    media_type: 'movie', title: "Harry Potter and the Philosopher's Stone", year: 2001, imagePath: '9YVLHfKlqxDil83Fjo8wM9rrMsF.jpg', deezerTrackId: 661779 },
  { tmdb_id: 454626, media_type: 'movie', title: 'Sonic the Hedgehog', year: 2020, imagePath: 'zaRaS0GDzWRZgQbC1kPrV3AfBaz.jpg', deezerTrackId: 855635572 },
  { tmdb_id: 329,    media_type: 'movie', title: 'Jurassic Park', year: 1993, imagePath: '86FXPjGWjrqKmmLszHow0KbI0Gd.jpg', deezerTrackId: 2296192 },
  { tmdb_id: 597,    media_type: 'movie', title: 'Titanic', year: 1997, imagePath: 'wOFY2xA3D3VHi3G6DPtrXXhPrqQ.jpg', deezerTrackId: 14552280 },
  { tmdb_id: 324857, media_type: 'movie', title: 'Spider-Man: Into the Spider-Verse', year: 2018, imagePath: 'e7CE5vx4KqUuz0peKdHRVZB0Pn8.jpg', deezerTrackId: 602456542 },
  { tmdb_id: 762504, media_type: 'movie', title: 'Nope', year: 2022, imagePath: 'sjKdYsl1X54NoMW4Hg4gEVHDNj3.jpg', deezerTrackId: 1827387367 },
  { tmdb_id: 9487,   media_type: 'movie', title: "A Bug's Life", year: 1998, imagePath: 'u2HrA8BMvvHURz5mVOIe9EM1zGx.jpg', deezerTrackId: 1761725407 },
  { tmdb_id: 1949,   media_type: 'movie', title: 'Zodiac', year: 2007, imagePath: 'elzsm8vIpYVh0s6ztFEKElqgXqe.jpg', deezerTrackId: 1064295 },
  { tmdb_id: 414906, media_type: 'movie', title: 'The Batman', year: 2022, imagePath: 'r0c7yCiSyrNaliuyC8Rt7nEIqf9.jpg', deezerTrackId: 1676658747 },
  { tmdb_id: 9297,   media_type: 'movie', title: 'Monster House', year: 2006, imagePath: 'avZBSIPr6WQTA8oIeoAlZxEPzYs.jpg', deezerTrackId: 3387500091 },
  { tmdb_id: 274,    media_type: 'movie', title: 'The Silence of the Lambs', year: 1991, imagePath: 'mbOx1wxMLikzwWUO9TKAcFIy6op.jpg', deezerTrackId: 2523696 },
  { tmdb_id: 155,    media_type: 'movie', title: 'The Dark Knight', year: 2008, imagePath: 'cfT29Im5VDvjE0RpyKOSdCKZal7.jpg', deezerTrackId: 904641 },
  { tmdb_id: 36557,  media_type: 'movie', title: 'Casino Royale', year: 2006, imagePath: '125H5AszmtAt0mYl2vpfChMFofv.jpg', deezerTrackId: 13148256 },
  { tmdb_id: 436270, media_type: 'movie', title: 'Black Adam', year: 2022, imagePath: '6tADMjbHhiZcgI7VmLrQzc7Idjk.jpg', deezerTrackId: 1942260767 },
  { tmdb_id: 76600,  media_type: 'movie', title: 'Avatar: The Way of Water', year: 2022, imagePath: 'xRqeK2V7KNKbCpuTSmn2UAW33Qr.jpg', deezerTrackId: 2069246367 },
  { tmdb_id: 1429,   media_type: 'tv',    title: 'Attack on Titan', year: 2013, imagePath: 'r8ASu35PeVg6RD8r1K90fGno5C1.jpg', deezerTrackId: 367620991 },
  { tmdb_id: 674324, media_type: 'movie', title: 'The Banshees of Inisherin', year: 2022, imagePath: 'nURjyngR8FhTk1H1piPn6icHtpP.jpg', deezerTrackId: 1972464607 },
  { tmdb_id: 2316,   media_type: 'tv',    title: 'The Office', year: 2005, imagePath: 'hLjbrIalcrvCLB74SW6G4B1wgJI.jpg', deezerTrackId: 11967190 },
  { tmdb_id: 1893,   media_type: 'movie', title: 'Star Wars: Episode I - The Phantom Menace', year: 1999, imagePath: '5fu7fzy4NZTsL1Jap00UBIInAuB.jpg', deezerTrackId: 493895402 },
  { tmdb_id: 791373, media_type: 'movie', title: "Zack Snyder's Justice League", year: 2021, imagePath: '45xAsbtYgKFzI3jZ0Cs7Y9iT7Ef.jpg', deezerTrackId: 1271269742 },
  { tmdb_id: 334541, media_type: 'movie', title: 'Manchester by the Sea', year: 2016, imagePath: 'p4DBb8UtBok8BHRI8kvgEQ4wLvK.jpg', deezerTrackId: 1096952502 },
  { tmdb_id: 72105,  media_type: 'movie', title: 'Ted', year: 2012, imagePath: '2x9K0Hin8JzvhrkD59zOXZigs2U.jpg', deezerTrackId: 38988011 },
  { tmdb_id: 600,    media_type: 'movie', title: 'Full Metal Jacket', year: 1987, imagePath: 'wcYrLS0dk62m8MnuFxCc86Hkzxq.jpg', deezerTrackId: 4210321 },
  { tmdb_id: 4232,   media_type: 'movie', title: 'Scream', year: 1996, imagePath: '4w6nQYAY0eb7B0VVRDXilXcgAUV.jpg', deezerTrackId: 584306882 },
  { tmdb_id: 2675,   media_type: 'movie', title: 'Signs', year: 2002, imagePath: 'ghYsj6YDOs6sSjGx6J9bJwpoU2m.jpg', deezerTrackId: 3116451 },
  { tmdb_id: 381288, media_type: 'movie', title: 'Split', year: 2016, imagePath: 'g0zsneDElWrVMHVaiGvIL8uze5.jpg', deezerTrackId: 900658282 },
  { tmdb_id: 672,    media_type: 'movie', title: 'Harry Potter and the Chamber of Secrets', year: 2002, imagePath: '4HLlQ3Yxw477ChXlQTNB7mKn4ra.jpg', deezerTrackId: 661878 },
  { tmdb_id: 74,     media_type: 'movie', title: 'War of the Worlds', year: 2005, imagePath: 'ee1ne2V7SskOrWj5D1freQcESg1.jpg', deezerTrackId: 4181115 },
  { tmdb_id: 744,    media_type: 'movie', title: 'Top Gun', year: 1986, imagePath: 'r4nnTrX5vZSZJ2zDJy06492DWo7.jpg', deezerTrackId: 7675051 },
  { tmdb_id: 45612,  media_type: 'movie', title: 'Source Code', year: 2011, imagePath: 'rVkDj1cFhuy29avSe0I6mnRyP0H.jpg', deezerTrackId: 345958231 },
  { tmdb_id: 436969, media_type: 'movie', title: 'The Suicide Squad', year: 2021, imagePath: 'cs6ZmIc6ZbhIT9WruU7tFdcOfko.jpg', deezerTrackId: 1434339682 },
  { tmdb_id: 6972,   media_type: 'movie', title: 'Australia', year: 2008, imagePath: 'uyls62dOEkdxbQOSQZzRLxe0l4k.jpg', deezerTrackId: 900431822 },
  { tmdb_id: 85,     media_type: 'movie', title: 'Raiders of the Lost Ark', year: 1981, imagePath: 'xvKgVY5Ho26qWzCnPrUPnfC4agE.jpg', deezerTrackId: 518485982 },
  { tmdb_id: 9377,   media_type: 'movie', title: "Ferris Bueller's Day Off", year: 1986, imagePath: 'h545gPlsTWwTvE6Mx1qpJ02h3Kr.jpg', deezerTrackId: 5551658 },
  { tmdb_id: 286217, media_type: 'movie', title: 'The Martian', year: 2015, imagePath: 'lzMS0CI3FLQYC5EgJoWeIaEt0lm.jpg', deezerTrackId: 108463018 },
  { tmdb_id: 308266, media_type: 'movie', title: 'War Dogs', year: 2016, imagePath: 'sozaX8UpFqDcHi8JAoYMC7kkev3.jpg', deezerTrackId: 10284917 },
  { tmdb_id: 954,    media_type: 'movie', title: 'Mission: Impossible', year: 1996, imagePath: 'pbaAkR1FDvgndTVFgGRIzf9o49r.jpg', deezerTrackId: 2436630 },
  { tmdb_id: 824,    media_type: 'movie', title: 'Moulin Rouge!', year: 2001, imagePath: 'XMVZ0aCdcnvdRwNteHGSRSWMMN.jpg', deezerTrackId: 2438249 },
  { tmdb_id: 2710,   media_type: 'tv',    title: "It's Always Sunny in Philadelphia", year: 2005, imagePath: 'rwZUz0Cm8DhxoOFpGBPLWrhb6MQ.jpg', deezerTrackId: 69178762 },
  { tmdb_id: 44115,  media_type: 'movie', title: '127 Hours', year: 2010, imagePath: '3fHui9gUUuDPJ8pdJTLyfIfCCvd.jpg', deezerTrackId: 1253659472 },
  { tmdb_id: 2080,   media_type: 'movie', title: 'X-Men Origins: Wolverine', year: 2009, imagePath: 'kCUz9rNRNeBJ2c9PwUdYTDs4ZEa.jpg', deezerTrackId: 120301276 },
  { tmdb_id: 424,    media_type: 'movie', title: "Schindler's List", year: 1993, imagePath: 'eMAHXzZXoNzximFSYm2hn0LiPB0.jpg', deezerTrackId: 6066638 },
  { tmdb_id: 269149, media_type: 'movie', title: 'Zootopia', year: 2016, imagePath: 'qL6eARmIgT1deUk6DWdagQCnDpX.jpg', deezerTrackId: 119048086 },
  { tmdb_id: 49049,  media_type: 'movie', title: 'Dredd', year: 2012, imagePath: '7eCSZgCFJWrz0gMOfsfUs9zWzf8.jpg', deezerTrackId: 92199380 },
  { tmdb_id: 245891, media_type: 'movie', title: 'John Wick', year: 2014, imagePath: 'eD7FnB7LLrBV5ewjdGLYTAoV9Mv.jpg', deezerTrackId: 117728340 },
  { tmdb_id: 270946, media_type: 'movie', title: 'Penguins of Madagascar', year: 2014, imagePath: '77KUH3Dheen9duqXitJD4nZHuom.jpg', deezerTrackId: 90247993 },
  { tmdb_id: 49047,  media_type: 'movie', title: 'Gravity', year: 2013, imagePath: 'AdWf6ZqKduTHEpPPydbxPqbErjH.jpg', deezerTrackId: 647272712 },
  { tmdb_id: 419704, media_type: 'movie', title: 'Ad Astra', year: 2019, imagePath: 'cjytKnwXW8Gy1HA6Ejwso4FmPSv.jpg', deezerTrackId: 774806122 },
  { tmdb_id: 5915,   media_type: 'movie', title: 'Into the Wild', year: 2007, imagePath: 'aQ8JUbfKDTfccYltwfTfhvRZDll.jpg', deezerTrackId: 407643962 },
  { tmdb_id: 9799,   media_type: 'movie', title: 'The Fast and the Furious', year: 2001, imagePath: 'ci7VF78E2UV8esDTLPS5luQawDW.jpg', deezerTrackId: 1496646032 },
  { tmdb_id: 346698, media_type: 'movie', title: 'Barbie', year: 2023, imagePath: 'mbYTRO33LJAgpCMrIn9ibiWHbMH.jpg', deezerTrackId: 2366043655 },
  { tmdb_id: 137106, media_type: 'movie', title: 'The Lego Movie', year: 2014, imagePath: 'aUAHuSiutsFRXno4DASDcbPidBB.jpg', deezerTrackId: 647445312 },
  { tmdb_id: 315162, media_type: 'movie', title: 'Puss in Boots: The Last Wish', year: 2022, imagePath: 'fxjVsIUTaFXI88Mwg27EKoLTdv2.jpg', deezerTrackId: 2044483077 },
  { tmdb_id: 346648, media_type: 'movie', title: 'Paddington 2', year: 2017, imagePath: '7zvLg5jdtcTCcWvbCSi7XIPQr7X.jpg', deezerTrackId: 424592192 },
  { tmdb_id: 76331,  media_type: 'tv',    title: 'Succession', year: 2018, imagePath: 'jibM75kx32e3ghcLxOzn1f4MQJR.jpg', deezerTrackId: 890421312 },
  { tmdb_id: 949,    media_type: 'movie', title: 'Heat', year: 1995, imagePath: '5JaR6UEoCJJLtLpqFOVMY4O4R7P.jpg', deezerTrackId: 3128844211 },
  { tmdb_id: 808,    media_type: 'movie', title: 'Shrek', year: 2001, imagePath: 'bNTHSd3UqqLzIVwbDOGPnx3ScfF.jpg', deezerTrackId: 917741 },
  { tmdb_id: 42009,  media_type: 'tv',    title: 'Black Mirror', year: 2011, imagePath: 'bnBBnbhEuuztnvu5VEYtPGfuLML.jpg', deezerTrackId: 11219974 },
  { tmdb_id: 1622,   media_type: 'tv',    title: 'Supernatural', year: 2005, imagePath: 'ud1OHZfmu2G7MA2lmkeaPwtlYP3.jpg', deezerTrackId: 4006895 },
  { tmdb_id: 578,    media_type: 'movie', title: 'Jaws', year: 1975, imagePath: 'sPSM46nQEgt8ynosttMEXbBAbEO.jpg', deezerTrackId: 93631710 },
  { tmdb_id: 110390, media_type: 'movie', title: 'A Pigeon Sat on a Branch Reflecting on Existence', year: 2014, imagePath: 'rx9Q7ZUUyxO4QDUp3CO8SiaMT6m.jpg', deezerTrackId: 1882938287 },
  { tmdb_id: 673,    media_type: 'movie', title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, imagePath: 'bq5tFxdTBJP4YW7JLy16uE1i9gp.jpg', deezerTrackId: 2794921 },
  { tmdb_id: 22881,  media_type: 'movie', title: 'The Blind Side', year: 2009, imagePath: 'tUXaYf7BYmNZGEz39UTl0V23DMF.jpg', deezerTrackId: 710779652 },
  { tmdb_id: 15,     media_type: 'movie', title: 'Citizen Kane', year: 1941, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 11036,  media_type: 'movie', title: 'The Notebook', year: 2004, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 776503, media_type: 'movie', title: 'CODA', year: 2021, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 11007,  media_type: 'movie', title: 'Cheaper by the Dozen', year: 2003, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 1894,   media_type: 'movie', title: 'Star Wars: Episode II - Attack of the Clones', year: 2002, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 36657,  media_type: 'movie', title: 'X-Men', year: 2000, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 103663, media_type: 'movie', title: 'Mud', year: 2012, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 674,    media_type: 'movie', title: 'Harry Potter and the Goblet of Fire', year: 2005, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 162,    media_type: 'movie', title: 'Edward Scissorhands', year: 1990, imagePath: 'JCFdCQ3gDRvx64JHSOEL2m06xL.jpg', deezerTrackId: 1097358 },
  { tmdb_id: 1724,   media_type: 'movie', title: 'The Incredible Hulk', year: 2008, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 13916,  media_type: 'tv',    title: 'Death Note', year: 2006, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 23168,  media_type: 'movie', title: 'The Town', year: 2010, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 565,    media_type: 'movie', title: 'The Ring', year: 2002, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 184,    media_type: 'movie', title: 'Jackie Brown', year: 1997, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 49519,  media_type: 'movie', title: 'The Croods', year: 2013, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 872585, media_type: 'movie', title: 'Oppenheimer', year: 2023, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 1892,   media_type: 'movie', title: 'Return of the Jedi', year: 1983, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 218,    media_type: 'movie', title: 'The Terminator', year: 1991, imagePath: '3waxLrnLPYBoo4PHxyidBcwf1hL.jpg', deezerTrackId: 889834692 },
  { tmdb_id: 8373,   media_type: 'movie', title: 'Transformers: Revenge of the Fallen', year: 2009, imagePath: 'r3QG903qbUNngvw7UpJjVKwzb8F.jpg', deezerTrackId: 3824710 },
  { tmdb_id: 557,    media_type: 'movie', title: 'Spider-Man', year: 2002, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 558,    media_type: 'movie', title: 'Spider-Man 2', year: 2004, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 9615,   media_type: 'movie', title: 'The Fast and the Furious: Tokyo Drift', year: 2006, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 14306,  media_type: 'movie', title: 'Hoodwinked!', year: 2005, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 1895,   media_type: 'movie', title: 'Star Wars: Episode III - Revenge of the Sith', year: 2005, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 146233, media_type: 'movie', title: 'Prisoners', year: 2013, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 4995,   media_type: 'movie', title: 'Boogie Nights', year: 1997, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 675,    media_type: 'movie', title: 'Harry Potter and the Order of the Phoenix', year: 2007, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 24428,  media_type: 'movie', title: 'The Avengers', year: 2012, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 150540, media_type: 'movie', title: 'Inside Out', year: 2015, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 82992,  media_type: 'movie', title: 'Fast & Furious 6', year: 2013, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 767,    media_type: 'movie', title: 'Harry Potter and the Half-Blood Prince', year: 2009, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 118340, media_type: 'movie', title: 'Guardians of the Galaxy', year: 2014, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 76170,  media_type: 'movie', title: 'The Wolverine', year: 2013, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 124905, media_type: 'movie', title: 'Godzilla', year: 2014, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 12444,  media_type: 'movie', title: 'Harry Potter and the Deathly Hallows: Part 1', year: 2010, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 419430, media_type: 'movie', title: 'Get Out', year: 2017, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 10138,  media_type: 'movie', title: 'Iron Man 2', year: 1993, imagePath: 'ehE92htoHxsItRFKAXIIhtyKyZr.jpg', deezerTrackId: 92722890 },
  { tmdb_id: 22,     media_type: 'movie', title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003, imagePath: 'zXMGAtDqJ58P8G3W4bwKyYffPhn.jpg', deezerTrackId: 24206311 },
  { tmdb_id: 4488,   media_type: 'movie', title: 'Friday the 13th', year: 1980, imagePath: '90f4YD4Je0N0ay6qBR1Zonlkzdz.jpg', deezerTrackId: 419382952 },
  { tmdb_id: 1359,   media_type: 'movie', title: 'American Psycho', year: 2000, imagePath: 'ytKNFowP7STVOgpK4HjaQLrfUbj.jpg', deezerTrackId: 3166724 },
  { tmdb_id: 9607,   media_type: 'movie', title: 'Super Mario Bros.', year: 1993, imagePath: 'u30qU9YnmTtR3MPuay6svXy7rEG.jpg', deezerTrackId: 89388957 },
  { tmdb_id: 564,    media_type: 'movie', title: 'The Mummy', year: 1999, imagePath: 'xF53bNcsU11G3t5nGNQ4jEkw3Th.jpg', deezerTrackId: 68247004 },
  { tmdb_id: 752,    media_type: 'movie', title: 'V for Vendetta', year: 2006, imagePath: 'wz6IF9RNz6gjPWUSutvKVsHnLPd.jpg', deezerTrackId: 646332202 },
  { tmdb_id: 9479,   media_type: 'movie', title: 'The Nightmare Before Christmas', year: 1993, imagePath: 'nJT0QZIB7e9af31JM6sOzMeTOgD.jpg', deezerTrackId: 3113199 },
  { tmdb_id: 1091,   media_type: 'movie', title: 'The Thing', year: 1982, imagePath: 'gl8jhRWV8k7yDEJLp51qtrV9FM0.jpg', deezerTrackId: 579929322 },
  { tmdb_id: 2667,   media_type: 'movie', title: 'The Blair Witch Project', year: 1992, imagePath: 'bxId3YhIb92GMWOaqUHHm9ptNBH.jpg', deezerTrackId: 16129859 },
  { tmdb_id: 433808, media_type: 'movie', title: 'The Ritual', year: 2017, imagePath: 'vaArQHq1lHFNppoJlMlv30Gs2fQ.jpg', deezerTrackId: 454027122 },
  { tmdb_id: 493922, media_type: 'movie', title: 'Hereditary', year: 2018, imagePath: 'iNOLDd81zpFrOakxXJRjusPXD3s.jpg', deezerTrackId: 867337592 },
  { tmdb_id: 61617,  media_type: 'movie', title: 'Over the Garden Wall', year: 2014, imagePath: 'tvhpbPkmGGFpabSwMt3bvTFndsD.jpg', deezerTrackId: 1213876762 },
  { tmdb_id: 70160,  media_type: 'movie', title: 'The Hunger Games', year: 2012, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 141,    media_type: 'movie', title: 'Donnie Darko', year: 2001, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 913290, media_type: 'movie', title: 'Barbarian', year: 2022, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 466420, media_type: 'movie', title: 'Killers of the Flower Moon', year: 2023, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 316029, media_type: 'movie', title: 'The Greatest Showman', year: 2017, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 299536, media_type: 'movie', title: 'Avengers: Infinity War', year: 2018, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 157336, media_type: 'movie', title: 'Interstellar', year: 2014, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 65,     media_type: 'movie', title: '8 Mile', year: 2002, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 293660, media_type: 'movie', title: 'Deadpool', year: 2016, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 324552, media_type: 'movie', title: 'John Wick: Chapter 2', year: 2017, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 37724,  media_type: 'movie', title: 'Skyfall', year: 2012, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 315635, media_type: 'movie', title: 'Spider-Man: Homecoming', year: 2017, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 9880,   media_type: 'movie', title: 'Shallow Hal', year: 2001, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 11395,  media_type: 'movie', title: 'The Santa Clause', year: 2014, imagePath: 'rcQZmnhcb6P4mkgJAHnCYp3c1gp.jpg', deezerTrackId: 2276884 },
  { tmdb_id: 49444,  media_type: 'movie', title: 'Kung Fu Panda 2', year: 2011, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 920,    media_type: 'movie', title: 'Cars', year: 2006, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 37799,  media_type: 'movie', title: 'The Social Network', year: 2010, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 98,     media_type: 'movie', title: 'Gladiator', year: 2000, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 114150, media_type: 'movie', title: 'Pitch Perfect', year: 2012, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 1210646, media_type: 'movie', title: 'Lady Ballers', year: 2023, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 563,    media_type: 'movie', title: 'Starship Troopers', year: 1997, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 639,    media_type: 'movie', title: 'When Harry Met Sally...', year: 1989, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 753342, media_type: 'movie', title: 'Napoleon', year: 2023, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 823482, media_type: 'movie', title: 'Dream Scenario', year: 2023, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 8374,   media_type: 'movie', title: 'The Boondock Saints', year: 1999, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 62560,  media_type: 'tv',    title: 'Mr. Robot', year: 2015, imagePath: 'image', deezerTrackId: 123 },
  { tmdb_id: 429200, media_type: 'movie', title: 'Good Time', year: 2017, imagePath: 'image', deezerTrackId: 123 },
  //{ tmdb_id: 491472, media_type: 'movie', title: "At Eternity's Gate", year: 2018, imagePath: 'zdZot7iyFRR5UAPvU3akJ0M7HL7.jpg', deezerTrackId: 581675692 },
]

// TMDB Client (still needed for getting movie details and hints)
class TMDBClient {
  private accessToken: string
  private cache = new Map<string, any>()

  constructor() {
    this.accessToken = process.env.TMDB_ACCESS_TOKEN!
    if (!this.accessToken) {
      throw new Error('TMDB_ACCESS_TOKEN not found in environment variables')
    }
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    const cacheKey = url
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || '1'
            console.log(`    Rate limited, waiting ${retryAfter}s...`)
            await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
            continue
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        this.cache.set(cacheKey, data)
        return data
      } catch (error) {
        if (attempt === retries - 1) throw error
        console.log(`    Retrying TMDB request (${attempt + 1}/${retries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  async getMovieDetails(movieId: number) {
    return this.fetchWithRetry(
      `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`
    )
  }

  async getTVDetails(tvId: number) {
    return this.fetchWithRetry(
      `https://api.themoviedb.org/3/tv/${tvId}?append_to_response=credits`
    )
  }
}

function constructImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath
  // Otherwise, construct the TMDB URL
  return `https://image.tmdb.org/t/p/original/${imagePath}`
}

// Validate image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Validate Deezer track ID
async function validateDeezerTrack(trackId: number): Promise<boolean> {
  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`)
    if (!response.ok) return false
    const data = await response.json()
    return !!data.preview // Must have a preview URL
  } catch {
    return false
  }
}

async function seedDatabase() {
  console.log('🎬 FrameGuessr Database Seeder (Manual Mode)')
  console.log('============================================')
  console.log('⚠️  This script will SKIP existing dates to protect your handpicked data')
  console.log('📝 Using manual image URLs and Deezer track IDs with validation')
  console.log('Loading environment variables...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const tmdbToken = process.env.TMDB_ACCESS_TOKEN

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    console.error('Required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
  }

  if (!tmdbToken) {
    console.error('❌ Missing TMDB_ACCESS_TOKEN')
    process.exit(1)
  }

  console.log('✓ Environment variables loaded')
  console.log('Creating clients...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const tmdb = new TMDBClient()

  // Start from July 1, 2025
  const startDate = new Date('2025-07-01')
  const today = new Date()
  const maxFutureDays = 365 // Don't seed more than 1 year in advance
  
  console.log('Starting seed from date:', format(startDate, 'yyyy-MM-dd'))
  console.log('Total movies to seed:', SEED_MOVIES.length)
  
  // Validate we're not seeding too far in the future
  const endDate = addDays(startDate, SEED_MOVIES.length - 1)
  const daysDifference = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDifference > maxFutureDays) {
    console.warn(`⚠️  Warning: Seeding ${daysDifference} days in the future (max recommended: ${maxFutureDays})`)
    console.log('Consider reducing the number of movies or starting from a later date')
  }
  
  // Check which dates already exist
  console.log('Checking existing data from', format(startDate, 'yyyy-MM-dd'), 'to', format(endDate, 'yyyy-MM-dd'))
  
  const { data: existingMovies } = await supabase
    .from('daily_movies')
    .select('date')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))

  const existingDates = new Set(existingMovies?.map(m => m.date) || [])
  console.log(`Found ${existingDates.size} existing entries - these will be SKIPPED`)
  console.log('')

  let successCount = 0
  let failCount = 0
  let skippedCount = 0
  let manualImageCount = 0
  let manualAudioCount = 0
  let validatedImageCount = 0
  let validatedAudioCount = 0

  for (let i = 0; i < SEED_MOVIES.length; i++) {
    const movie = SEED_MOVIES[i]
    const date = format(addDays(startDate, i), 'yyyy-MM-dd')
    
    // Skip if date already exists (protects handpicked data)
    if (existingDates.has(date)) {
      console.log(`[${i + 1}/${SEED_MOVIES.length}] ⏭️  SKIPPING ${date} - already exists (protecting your data)`)
      skippedCount++
      continue
    }
    
    console.log(`[${i + 1}/${SEED_MOVIES.length}] Processing ${movie.title} for ${date}...`)

    try {
      // Get movie/show details from TMDB
      const isMovie = movie.media_type === 'movie'
      console.log(`  → Fetching ${isMovie ? 'movie' : 'TV'} details from TMDB...`)
      const details = isMovie
        ? await tmdb.getMovieDetails(movie.tmdb_id)
        : await tmdb.getTVDetails(movie.tmdb_id)

      // Handle image URL with validation
      const imageUrl = movie.imagePath ? constructImageUrl(movie.imagePath) : ''
      let imageValidated = false
      
      if (movie.imagePath) {
        console.log(`  → Using manual image: ${movie.imagePath}`)
        manualImageCount++
        
        console.log(`  → Validating image URL...`)
        imageValidated = await validateImageUrl(imageUrl)
        if (imageValidated) {
          validatedImageCount++
          console.log(`  ✅ Image URL is accessible`)
        } else {
          console.log(`  ⚠️  Image URL may not be accessible`)
        }
      } else {
        console.log(`  → No manual image provided`)
      }

      // Handle Deezer track with validation
      let audioValidated = false
      if (movie.deezerTrackId) {
        console.log(`  → Using manual Deezer track ID: ${movie.deezerTrackId}`)
        manualAudioCount++
        
        console.log(`  → Validating Deezer track...`)
        audioValidated = await validateDeezerTrack(movie.deezerTrackId)
        if (audioValidated) {
          validatedAudioCount++
          console.log(`  ✅ Deezer track has preview available`)
        } else {
          console.log(`  ⚠️  Deezer track may not have preview`)
        }
      } else {
        console.log(`  → No manual Deezer track ID provided`)
      }

      // Extract information for hints - FIXED STRUCTURE
      const releaseYear = isMovie 
        ? details.release_date ? new Date(details.release_date).getFullYear() : movie.year
        : details.first_air_date ? new Date(details.first_air_date).getFullYear() : movie.year

      const cast = details.credits?.cast
        ?.filter((c: any) => c.order < 5)
        ?.map((c: any) => c.name) || []
      
      const director = isMovie 
        ? details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''
        : details.created_by?.[0]?.name || ''

      const genre = details.genres?.[0]?.name || 'Unknown'
      const tagline = details.tagline || ''

      // FIXED: Use correct hint structure that matches your TypeScript types
      const hints = {
        level1: { 
          type: 'image', 
          data: imageUrl 
        },
        level2: {
          type: 'tagline',  // Fixed: was 'mixed'
          data: {
            image: imageUrl,
            tagline: tagline
          }
        },
        level3: {
          type: 'metadata',  // Fixed: was 'full'
          data: {
            image: imageUrl,
            tagline: tagline,
            year: releaseYear,
            genre: genre,
            // Store additional details for the completion screen
            director: director,
            actors: cast.slice(0, 3)
          }
        }
      }

      const seedData = {
        date,
        tmdb_id: movie.tmdb_id,
        media_type: movie.media_type,
        title: isMovie ? details.title : details.name,
        year: releaseYear,
        image_url: imageUrl,
        hints: hints,
        deezer_track_id: movie.deezerTrackId || null,
        // Store additional metadata for potential future use
        overview: details.overview || '',
        genre: genre,
        director: director,
        actors: cast
      }

      // Use INSERT with ON CONFLICT DO NOTHING to avoid overwriting existing data
      const { error } = await supabase
        .from('daily_movies')
        .insert(seedData)

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`  ⏭️  SKIPPED - ${date} already exists`)
          skippedCount++
        } else {
          console.error(`  ❌ Database error:`, error.message)
          failCount++
        }
      } else {
        console.log(`  ✅ Successfully seeded ${isMovie ? details.title : details.name}`)
        successCount++
      }
    } catch (err) {
      console.error(`  ❌ Error:`, err instanceof Error ? err.message : 'Unknown error')
      failCount++
    }

    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 750))
  }

  console.log('\n=============================')
  console.log(`🎬 Seeding complete!`)
  console.log(`   New entries: ${successCount}`)
  console.log(`   Skipped (protected): ${skippedCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   Total processed: ${SEED_MOVIES.length}`)
  console.log('')
  console.log(`📸 Manual Images: ${manualImageCount} (${validatedImageCount} validated)`)
  console.log(`🎵 Manual Audio: ${manualAudioCount} (${validatedAudioCount} validated)`)
  console.log('')
  
  if (manualImageCount > validatedImageCount) {
    console.log(`⚠️  ${manualImageCount - validatedImageCount} image(s) may not be accessible`)
  }
  if (manualAudioCount > validatedAudioCount) {
    console.log(`⚠️  ${manualAudioCount - validatedAudioCount} audio track(s) may not have previews`)
  }
  
  console.log('')
  console.log('🛡️  Your existing handpicked data was protected!')
  if (skippedCount > 0) {
    console.log(`   ${skippedCount} existing entries were left untouched`)
  }
  console.log('')
  console.log('🎮 Your FrameGuessr database is ready!')
  console.log('')
  console.log('📝 To add more entries:')
  console.log('   1. Add them to the SEED_MOVIES array with imagePath and deezerTrackId')
  console.log('   2. For imagePath, use just the filename like "nkmtCLg6afpSfdQcyNs2jemfSLR.jpg"')
  console.log('   3. Run this script again - existing dates will be protected')
  console.log('   4. The script now validates image and audio URLs automatically')
}

// Run the seed function
seedDatabase().catch(console.error)