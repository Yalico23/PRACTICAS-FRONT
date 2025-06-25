
const SaveEntrevista = () => {

  return (
    <>
      <div className=" mx-auto mt-4 p-6 bg-[#383b3f]">
        <h1 className="text-2xl font-bold mb-6 text-[#F8F9FA]">
          Crear Entrevista
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-[#E9ECEF]">
              Título de la Entrevista
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ingrese el título"
            />
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-[#E9ECEF]">
              Descripción de la Entrevista
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ingrese el título"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SaveEntrevista;
