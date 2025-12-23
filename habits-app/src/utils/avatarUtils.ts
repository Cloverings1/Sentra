const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const validateAvatarFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PNG, JPG, or WebP image' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image must be smaller than 2MB' };
  }
  return { valid: true };
};

export const generateAvatarPath = (userId: string, fileName: string): string => {
  const ext = fileName.split('.').pop();
  const timestamp = Date.now();
  return `${userId}/avatar-${timestamp}.${ext}`;
};

export const getAvatarInitials = (name: string, email: string): string => {
  if (name && name !== email.split('@')[0]) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
};
