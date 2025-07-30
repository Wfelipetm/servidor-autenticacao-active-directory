import ldap from 'ldapjs';
import dotenv from 'dotenv';

dotenv.config();

const testLdapConnection = () => {
    const client = ldap.createClient({
        url: process.env.LDAP_URL
    });

    console.log('🔗 Testando conexão LDAP...');
    console.log('URL:', process.env.LDAP_URL);
    console.log('Bind DN:', process.env.LDAP_BIND_DN);

    // Teste 1: Conexão básica
    client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS, (err) => {
        if (err) {
            console.error('❌ Erro no bind:', err.message);
            console.log('\n🔧 Possíveis soluções:');
            console.log('1. Verifique se a senha está correta');
            console.log('2. Tente: ITG\\wallace.moreira');
            console.log('3. Tente: CN=wallace.moreira,OU=Area Tecnica,OU=STI,OU=Prefeitura,DC=itg,DC=rio');
        } else {
            console.log('✅ Bind realizado com sucesso!');

            // Teste 2: Busca de usuário
            const searchOptions = {
                filter: process.env.LDAP_SEARCH_FILTER.replace('{{username}}', 'wallace.moreira'),
                scope: 'sub',
                attributes: ['sAMAccountName', 'cn', 'mail', 'dn']
            };

            client.search(process.env.LDAP_SEARCH_BASE, searchOptions, (err, res) => {
                if (err) {
                    console.error('❌ Erro na busca:', err.message);
                } else {
                    console.log('🔍 Buscando usuário wallace.moreira...');

                    res.on('searchEntry', (entry) => {
                        console.log('✅ Usuário encontrado:', entry.object);
                    });

                    res.on('error', (err) => {
                        console.error('❌ Erro na busca:', err.message);
                    });

                    res.on('end', (result) => {
                        console.log('🏁 Busca finalizada:', result.status);
                    });
                }
            });
        }

        client.unbind();
    });
};

testLdapConnection();
