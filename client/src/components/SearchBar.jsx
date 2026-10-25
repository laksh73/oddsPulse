import './SearchBar.css'

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <input
      type="text"
      placeholder="Search teams..."
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
      className="search-input"
    />
  )
}

export default SearchBar