// Configuración de Babel para Expo y Expo Router (rutas basadas en archivos)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel'],
  };
};
