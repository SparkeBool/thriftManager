// client/src/pages/Home.jsx
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-primary">Welcome to Thrift Management App</h1>
      <p className="lead">Track your savings and goals with ease.</p>
    </motion.div>
  )
}

export default Home
