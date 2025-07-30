import jwt from 'jsonwebtoken';
import passport from 'passport';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Usuários em memória
const users = [];

dotenv.config();

const generateToken = (id, name, email, role) => {
    return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }
    // Verifica se já existe
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'Usuário já cadastrado' });
    }
    // Cria usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    users.push(newUser);
    res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser.id, newUser.name, newUser.email, newUser.role),
    });
};

export const loginUser = async (req, res) => {
    const { data, password } = req.body;
    if (!data || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }
    try {
        if (data.includes('@')) {
            const email = data;
            let user = users.find(u => u.email === email);
            if (user && (await bcrypt.compare(password, user.password))) {
                return res.status(200).json({
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user.id, user.name, user.email, user.role),
                });
            } else {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
        } else if (data.includes('.')) {
            const username = data;
            req.body.username = username;
            req.body.password = password;

            console.log('🔍 Tentando autenticação LDAP para usuário:', username);
            console.log('🔧 Configurações LDAP:', {
                url: process.env.LDAP_URL,
                bindDN: process.env.LDAP_BIND_DN,
                searchBase: process.env.LDAP_SEARCH_BASE,
                searchFilter: process.env.LDAP_SEARCH_FILTER
            });

            passport.authenticate("ldapauth", { session: false }, async (err, ldapUser, info) => {
                console.log('Resultado da autenticação LDAP:');
                console.log('Erro:', err);
                console.log('Usuário LDAP:', ldapUser);
                console.log('Info:', info);

                if (err) {
                    console.error('🚨 Erro detalhado LDAP:', err);
                    return res.status(500).json({
                        error: "Erro interno no servidor",
                        details: err.message,
                        ldapConfig: {
                            url: process.env.LDAP_URL,
                            bindDN: process.env.LDAP_BIND_DN?.substring(0, 10) + '...',
                            searchBase: process.env.LDAP_SEARCH_BASE
                        }
                    });
                }
                if (!ldapUser) {
                    console.log('🔐 Falha na autenticação LDAP - usuário não encontrado ou senha inválida');
                    return res.status(401).json({ error: "Usuário ou senha inválidos" });
                }
                try {
                    const username = ldapUser.sAMAccountName;
                    const name = ldapUser.cn;
                    const email = ldapUser.mail;
                    const dn = ldapUser.dn;
                    const memberOf = ldapUser.memberOf;
                    const description = ldapUser.description;
                    const department = ldapUser.department;
                    let user = users.find(u => u.username === username || u.email === email);
                    if (!user) {
                        user = {
                            id: users.length + 1,
                            username,
                            name,
                            email,
                            role: 'Servidor',
                            dn,
                            memberOf,
                            description,
                            department,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        users.push(user);
                    } else {
                        user.name = name;
                        user.email = email;
                        user.dn = dn;
                        user.memberOf = memberOf;
                        user.description = description;
                        user.department = department;
                        user.updatedAt = new Date();
                    }
                    const token = generateToken(user.id, user.name, user.email, user.role);
                    return res.json({
                        user: {
                            _id: user.id,
                            username: user.username,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            matricula: user.description,
                            departament: user.department,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                        },
                        token
                    });
                } catch (error) {
                    return res.status(500).json({ error: "Erro ao salvar ou autenticar o usuário", message: error.message });
                }
            })(req, res);
        } else {
            return res.status(400).json({ message: 'Formato de login inválido' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    // Simples exemplo: pega o id do token (req.user.id)
    const user = users.find(u => u.id === req.user.id);
    if (user) {
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
};
