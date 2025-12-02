export default function Search() {
  return (
    <input 
      type="text" 
      placeholder="Search..." 
      className="
        absolute 
        top-4 
        left-4 
        z-50
        backdrop-blur-md 
        px-4 py-2 
        rounded-full 
        border 
        border-gray-300
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        w-84
        bg-white"
    />
  )
}
