import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './index.js';
import { v2 as cloudinary } from 'cloudinary';

// Mock data
const mockFile = {
  buffer: Buffer.from('test-image'),
  originalname: 'test.jpg',
  mimetype: 'image/jpeg'
};

// Mock implementations
vi.mock('multer', () => ({
  default: () => ({
    single: () => (req, res, next) => {
      req.file = mockFile;
      next();
    }
  }),
  memoryStorage: () => ({
    _handleFile: (req, file, cb) => cb(null, mockFile),
    _removeFile: (req, file, cb) => cb(null)
  })
}));

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((options, callback) => {
        let result = {
          public_id: options.public_id || `cloudinary_${Math.random().toString(36).substring(7)}`,
          secure_url: `https://res.cloudinary.com/mock/image/upload/${options.public_id || 'default'}.jpg`,
          asset_folder: options.asset_folder
        };
        callback(null, result);
        return { end: vi.fn() };
      }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

describe('POST Endpoint Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server.close();
  });
  
    it('GET / should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Élelmiszermentő platform v1.0.0');
    });

    describe('Profile Picture Upload (/pfp)', () => {
        it('Profilkép sikeres feltöltése', async () => {
          const response = await request(app)
            .post('/pfp')
            .field('publicID', '') // Empty publicID to let Cloudinary generate one
            .attach('fajl', mockFile.buffer, mockFile.originalname);
    
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('public_id');
          expect(response.body).toHaveProperty('url');
          expect(response.body.public_id).toMatch(/^[\w-]+$/); // Basic format check
          expect(response.body.url).toMatch(/^https:\/\/res\.cloudinary\.com\/.+/);
        });
    
        });
    
      describe('Food Image Upload (/etel)', () => {
        it('Automatikusan generált PublicID', async () => {
          const response = await request(app)
            .post('/etel')
            .field('publicID', '')
            .attach('fajl', mockFile.buffer, mockFile.originalname);
    
          expect(response.status).toBe(200);
          expect(response.body.public_id).not.toBe('');
          expect(response.body.url).toBeDefined();
        });
      });
    
      describe('Recipe Image Upload (/recept)', () => {
        it('Recept feltöltés', async () => {
          const response = await request(app)
            .post('/recept')
            .field('publicID', '')
            .attach('fajl', mockFile.buffer, mockFile.originalname);
    
          expect(response.status).toBe(200);
          expect(response.body.public_id).not.toBe('');
           // Exact match
        });
      });
    });

  describe('Képtörlés', () => {
    it('DELETE /del/:publicId - sikeres törlés', async () => {
      const response = await request(app)
        .delete('/del/test_image_123');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ result: 'ok' });
    });

    it('DELETE /del/:publicId - hiányzó publicId', async () => {
      const response = await request(app)
        .delete('/del/');
      
      expect(response.status).toBe(404);
    });
  });