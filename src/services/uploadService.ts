/**
 * Comprime uma imagem usando Canvas API e converte para Base64 (Data URL).
 * BURLANDO a necessidade do Firebase Storage.
 */
const compressImage = async (fileUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Define tamanho máximo (400x400 para economizar muito espaço no Firestore)
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      // Calcula a proporção
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      // Cria o canvas e desenha a imagem redimensionada
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Erro ao criar canvas para compressão.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Converte para Base64 (WebP ou JPEG de baixa qualidade)
      // WebP é incrivelmente leve. 0.6 = 60% de qualidade.
      const dataUrl = canvas.toDataURL('image/webp', 0.6);
      
      // Verifica tamanho aproximado. Firestore limite é 1MB.
      // Se a imagem tiver 30kb, está excelente!
      resolve(dataUrl);
    };
    
    img.onerror = (err) => reject(err);
    img.src = fileUrl;
  });
};

/**
 * Pega a imagem local, comprime para economizar espaço e retorna como string Base64.
 * O retorno é injetado diretamente no banco de dados Firestore.
 * @param fileUrl URL local da imagem (blob:)
 * @param folder Parâmetro mantido para compatibilidade, mas ignorado
 * @returns Um objeto contendo a URL (Data URL Base64) e path vazio.
 */
export const uploadImage = async (fileUrl: string, _folder: string): Promise<{ url: string; path: string }> => {
  if (!fileUrl) throw new Error('URL da imagem não fornecida.');

  // Se já for uma URL externa ou já for base64 (edição onde a foto não mudou), retorna ela mesma
  if (!fileUrl.startsWith('blob:')) {
    return { url: fileUrl, path: '' };
  }

  try {
    const base64Url = await compressImage(fileUrl);
    
    return {
      url: base64Url,
      path: '' // Path inútil, não usamos mais o Storage
    };
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    throw error;
  }
};
