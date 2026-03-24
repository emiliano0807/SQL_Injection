/**
 * ⚠️  VERSIÓN VULNERABLE - SOLO PARA FINES EDUCATIVOS ⚠️
 * * Este servidor tiene VULNERABILIDADES INTENCIONALES de:
 * - Inyección SQL
 * - Inyección NoSQL
 * - Inyección LDAP
 * - Inyección XPath
 * - Inyección GraphQL
 * * NUNCA uses este código en producción.
 */

const express = require('express');
const Database = require('better-sqlite3');
const session = require('express-session');
const path = require('path');
const { buildSchema, graphql } = require('graphql');
const xpath = require('xpath');
const { DOMParser } = require('@xmldom/xmldom');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'ciberseguridad-secret-key',
    resave: false,
    saveUninitialized: false
}));

// ── Base de datos SQLite (SQL Real) ─────────────────────────────────
const db = new Database(path.join(__dirname, 'usuarios.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL
  )
`);

const existe = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE usuario = ?').get('administrador');
if (existe.count === 0) {
    db.prepare('INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)').run('administrador', 'pruebadeacceso1');
    console.log('✅ Usuario "administrador" creado en SQLite.');
}

// ══════════════════════════════════════════════════════════════════════
// DATOS SIMULADOS UNIFICADOS (Válidos para inicios de sesión legítimos)
// ══════════════════════════════════════════════════════════════════════

// ── NoSQL ───────────────────────────────────────────────────────────
const nosqlUsers = [
    { _id: '1', usuario: 'administrador', contrasena: 'pruebadeacceso1', rol: 'superadmin' },
    { _id: '2', usuario: 'connecttec', contrasena: 'admin123', rol: 'admin' }
];

// ── LDAP ────────────────────────────────────────────────────────────
const ldapDirectory = [
    { uid: 'administrador', userPassword: 'pruebadeacceso1', cn: 'Administrador Principal', mail: 'admin@sistema.local', role: 'superadmin' },
    { uid: 'connecttec', userPassword: 'admin123', cn: 'ConnectTec Admin', mail: 'admin@facioriv.com', role: 'admin' }
];

// ── XPath (XML) ─────────────────────────────────────────────────────
const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <username>administrador</username>
    <password>pruebadeacceso1</password>
    <role>superadmin</role>
    <email>admin@sistema.local</email>
  </user>
  <user>
    <username>connecttec</username>
    <password>admin123</password>
    <role>admin</role>
    <email>admin@facioriv.com</email>
  </user>
</users>`;
const xmlDoc = new DOMParser().parseFromString(xmlData, 'text/xml');

// ── GraphQL ─────────────────────────────────────────────────────────
const graphqlUsers = [
    { id: 1, username: 'administrador', password: 'pruebadeacceso1', role: 'superadmin', email: 'admin@sistema.local' },
    { id: 2, username: 'connecttec', password: 'admin123', role: 'admin', email: 'admin@facioriv.com' }
];

const graphqlConfigs = [
    { key: 'DB_HOST', value: 'internal-db.empresa.local' },
    { key: 'JWT_SECRET', value: 'my_jwt_secret_key_never_share' }
];

// ══════════════════════════════════════════════════════════════════════
// RUTAS DE NAVEGACIÓN Y REGISTRO
// ══════════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
    if (req.session.usuario) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/lab', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'injections.html'));
});

// NUEVO: Endpoint para registrar un usuario en TODOS los sistemas a la vez
app.post('/register', (req, res) => {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) return res.json({ success: false, message: 'Faltan credenciales.' });

    try {
        // 1. Insertar en SQLite
        db.prepare('INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)').run(usuario, contrasena);
        
        // 2. Insertar en NoSQL
        nosqlUsers.push({ _id: Date.now().toString(), usuario, contrasena, rol: 'usuario_creado' });
        
        // 3. Insertar en LDAP
        ldapDirectory.push({ uid: usuario, userPassword: contrasena, cn: usuario, mail: `${usuario}@sistema.local`, role: 'usuario_creado' });
        
        // 4. Insertar en GraphQL
        graphqlUsers.push({ id: Date.now(), username: usuario, password: contrasena, role: 'usuario_creado', email: `${usuario}@sistema.local` });
        
        // 5. Insertar en XPath (XML)
        const newUserXml = xmlDoc.createElement('user');
        const uName = xmlDoc.createElement('username'); uName.appendChild(xmlDoc.createTextNode(usuario));
        const uPass = xmlDoc.createElement('password'); uPass.appendChild(xmlDoc.createTextNode(contrasena));
        const uRole = xmlDoc.createElement('role'); uRole.appendChild(xmlDoc.createTextNode('usuario_creado'));
        newUserXml.appendChild(uName); newUserXml.appendChild(uPass); newUserXml.appendChild(uRole);
        xmlDoc.documentElement.appendChild(newUserXml);

        console.log(`➕ Nuevo usuario global registrado: ${usuario}`);
        res.json({ success: true, message: `Usuario '${usuario}' creado globalmente en todos los paneles.` });
    } catch (err) {
        res.json({ success: false, message: 'El usuario ya existe o hubo un error al registrarlo.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// ENDPOINTS VULNERABLES
// ══════════════════════════════════════════════════════════════════════

// 🚨 1. INYECCIÓN SQL
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const query = `SELECT * FROM usuarios WHERE usuario = '${usuario}' AND contrasena = '${contrasena}'`;
    try {
        const user = db.prepare(query).get();
        if (user) {
            req.session.usuario = user.usuario;
            return res.json({ success: true, message: `¡Bienvenido, ${user.usuario}!` });
        }
        return res.json({ success: false, message: 'Credenciales SQL incorrectas.' });
    } catch (err) {
        return res.json({ success: false, message: `Error SQL: ${err.message}` });
    }
});

// 🚨 2. INYECCIÓN NoSQL
app.post('/nosql-login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const found = nosqlUsers.find(user => matchNoSQL(user.usuario, usuario) && matchNoSQL(user.contrasena, contrasena));
    
    if (found) {
        req.session.usuario = found.usuario;
        return res.json({ success: true, message: `¡Acceso concedido! Usuario: ${found.usuario}` });
    }
    return res.json({ success: false, message: 'Credenciales NoSQL incorrectas.' });
});

function matchNoSQL(fieldValue, input) {
    if (typeof input === 'string') return fieldValue === input;
    if (typeof input === 'object' && input !== null) {
        if (input['$ne'] !== undefined) return fieldValue !== input['$ne'];
        if (input['$gt'] !== undefined) return fieldValue > input['$gt'];
    }
    return false;
}

// 🚨 3. INYECCIÓN LDAP
app.post('/ldap-login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const filter = `(&(uid=${usuario})(userPassword=${contrasena}))`;
    const found = ldapDirectory.find(entry => matchLDAP(entry, usuario, contrasena));

    if (found) {
        req.session.usuario = found.uid;
        return res.json({ success: true, message: `¡Acceso LDAP concedido a ${found.cn}!`, filter });
    }
    return res.json({ success: false, message: 'Credenciales LDAP incorrectas.', filter });
});

function matchLDAP(entry, userInput, passInput) {
    if (userInput.includes(')(|') || passInput.includes(')(uid=')) return true; // Simulación de Inyección
    return entry.uid === userInput && entry.userPassword === passInput; // Login legítimo
}

// 🚨 4. INYECCIÓN XPath
app.post('/xpath-login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const xpathQuery = `//user[username/text()='${usuario}' and password/text()='${contrasena}']`;
    try {
        const nodes = xpath.select(xpathQuery, xmlDoc);
        if (nodes && nodes.length > 0) {
            const username = xpath.select('string(username)', nodes[0]);
            req.session.usuario = username;
            return res.json({ success: true, message: `¡Acceso XPath concedido a ${username}!`, query: xpathQuery });
        }
        return res.json({ success: false, message: 'Credenciales XPath incorrectas.', query: xpathQuery });
    } catch (err) {
        return res.json({ success: false, message: `Error XPath: ${err.message}`, query: xpathQuery });
    }
});

// 🚨 5. INYECCIÓN GraphQL
const schema = buildSchema(`
  type User { id: Int, username: String, password: String, role: String, email: String }
  type Query { users: [User], user(id: Int!): User }
`);

const graphqlRoot = {
    users: () => graphqlUsers,
    user: ({ id }) => graphqlUsers.find(u => u.id === id)
};

app.post('/graphql', async (req, res) => {
    const { query, variables } = req.body;
    try {
        const result = await graphql({ schema, source: query, rootValue: graphqlRoot, variableValues: variables });
        if (result.data && !result.errors) req.session.usuario = 'graphql_hacker';
        res.json(result);
    } catch (err) {
        res.status(400).json({ errors: [{ message: err.message }] });
    }
});

// ══════════════════════════════════════════════════════════════════════
// RUTAS AUXILIARES
// ══════════════════════════════════════════════════════════════════════

app.get('/dashboard', (req, res) => {
    if (!req.session.usuario) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/user', (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ error: 'No autenticado' });
    res.json({ usuario: req.session.usuario });
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Credenciales globales: usuario="administrador" | contraseña="pruebadeacceso1"`);
    console.log(`🏢 Credenciales extra: usuario="connecttec" | contraseña="admin123"`);
});