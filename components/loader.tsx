// components/Loader.js
const Loader = () => {
  return (
    <div className="loader">
      <style jsx>{`
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f0f0f0;
        }
      `}</style>
      <div>Loading...</div>
    </div>
  );
};

export default Loader;
