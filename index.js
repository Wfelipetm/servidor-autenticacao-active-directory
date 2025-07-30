import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import LdapStrategy from "passport-ldapauth";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Passport LDAP strategy config (ajuste conforme seu ambiente)
passport.use(
    new LdapStrategy({
        server: {
            url: process.env.LDAP_URL,
            bindDN: process.env.LDAP_BIND_DN,
            bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
            searchBase: process.env.LDAP_SEARCH_BASE,
            searchFilter: process.env.LDAP_SEARCH_FILTER,
            searchAttributes: ['sAMAccountName', 'cn', 'mail', 'memberOf', 'description', 'department', 'dn'],
            tlsOptions: {
                rejectUnauthorized: false
            }
        },
        usernameField: 'username',
        passwordField: 'password'
    })
);

app.use(passport.initialize());

// Rotas
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
});
