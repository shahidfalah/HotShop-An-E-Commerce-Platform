

const outlineInput = ()=> {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="input" className="text-sm font-medium text-gray-700">
        Input
      </label>
      <input
        id="input"
        type="text"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default outlineInput;