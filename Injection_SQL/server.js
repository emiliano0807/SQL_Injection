const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Configuración de sesión
app.use(session({
  secret: 'clave-secreta-para-demo', // cámbiala en producción
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // en HTTPS debería ser true
}));

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos persistente
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  // Insertar usuarios de prueba si la tabla está vacía
  db.get('SELECT COUNT(*) AS count FROM usuarios', (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO usuarios (username, password) VALUES (?, ?)');
      stmt.run('admin', 'secreta123');
      stmt.run('usuario1', 'pass123');
      stmt.run('invitado', 'guest');
      stmt.finalize();
      console.log('Usuarios de prueba insertados.');
    }
  });
});

// -------------------- RUTAS DE LOGIN --------------------

app.post('/login/vulnerable', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`;
  console.log('[VULNERABLE] Consulta:', query);

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error en consulta vulnerable:', err.message);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    const acceso = rows.length > 0;
    if (acceso) {
      req.session.user = rows[0].username;
    }

    res.json({
      modo: 'VULNERABLE',
      consulta: query,
      acceso,
      mensaje: acceso ? 'Acceso concedido' : 'Acceso denegado',
      usuario: acceso ? rows[0].username : null
    });
  });
});

app.post('/login/seguro', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
  console.log('[SEGURO] Consulta parametrizada:', query, username, password);

  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error('Error en consulta segura:', err.message);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    const acceso = !!row;
    if (acceso) {
      req.session.user = row.username;
    }

    res.json({
      modo: 'SEGURO',
      consulta: query + ' (con placeholders)',
      acceso,
      mensaje: acceso ? 'Acceso concedido' : 'Acceso denegado',
      usuario: acceso ? row.username : null
    });
  });
});

// -------------------- PANEL DE ADMINISTRACIÓN --------------------

// Middleware para comprobar si el usuario es admin
function esAdmin(req, res, next) {
  if (req.session.user === 'admin') {
    next();
  } else {
    res.status(403).send('Acceso denegado. Se necesita ser administrador.');
  }
}

// Servir página de administración (protegida)
app.get('/admin', esAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Obtener lista de usuarios (solo para admin)
app.get('/admin/usuarios', esAdmin, (req, res) => {
  db.all('SELECT id, username FROM usuarios', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(rows);
  });
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensaje: 'Sesión cerrada' });
});

// Información de la sesión actual (para el frontend)
app.get('/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});