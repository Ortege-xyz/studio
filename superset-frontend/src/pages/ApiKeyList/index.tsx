import { t } from '@superset-ui/core';
import Button from 'src/components/Button';
import SubMenu from 'src/features/home/SubMenu';
import withToasts, { useToasts } from 'src/components/MessageToasts/withToasts';
import { Card, Status, Table, TableItem, Text } from './styled';
import { useState } from 'react';

function ApiKeyList() {
  const { addSuccessToast } = useToasts();

  const current_plan = 'Free tier';
  const [keys, setKeys] = useState([
    {
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
      created: '2024-03-20',
      expires: '2024-04-20',
      status: 'Active',
      show: false,
    },
    {
      token: 'kJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1...',
      created: '2024-02-15',
      expires: '2024-03-15',
      status: 'Expired',
      show: false,
    },
  ]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addSuccessToast('Copied the API Key.');
  };

  const showKey = (index: number) => {
    const key = keys[index];
    console.log(key);
    key.show = !key.show;
    const newKeys = [...keys];
    newKeys[index] = key;
    setKeys(newKeys);
  };

  return (
    <div>
      <SubMenu name={t('Api Keys Management')} />
      <Card>
        <Text>
          {t('Current plan')}: {current_plan}
        </Text>
        <Button
          type="primary"
          buttonStyle="primary"
          cta
          style={{ maxWidth: '200px' }}
        >
          {t('Upgrade to PRO plan')}
        </Button>
        <Text>{t('Generate New API key')}</Text>
        <Button
          type="primary"
          buttonStyle="success"
          cta
          style={{ maxWidth: '200px' }}
        >
          {t('Generate JWT Token')}
        </Button>
        <Text>{t('Your API keys')}</Text>
        <Table>
          <thead>
            <tr>
              <th>
                <span>Token</span>
              </th>
              <th>
                <span>Actions</span>
              </th>
              <th>
                <span>Created</span>
              </th>
              <th>
                <span>Expires</span>
              </th>
              <th>
                <span>Status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key, index) => {
              return (
                <tr key={index}>
                  <td>
                    <TableItem style={{ width: '20vw' }}>
                      <span>{key.show ? key.token : '********'}</span>
                    </TableItem>
                  </td>
                  <td>
                    <TableItem>
                      <Button onClick={() => showKey(index)}>
                        {key.show ? (
                          <i className="fa fa-eye-slash" />
                        ) : (
                          <i className="fa fa-eye" />
                        )}
                      </Button>
                      <Button onClick={() => copyText(key.token)}>
                        <i className="fa fa-copy" />
                        <span>Copy</span>
                      </Button>
                      {key.status === 'Active' && (
                        <Button type="primary" buttonStyle="danger">
                          <span>Revoke</span>
                        </Button>
                      )}
                    </TableItem>
                  </td>
                  <td>
                    <TableItem>
                      <span>{key.created}</span>
                    </TableItem>
                  </td>
                  <td>
                    <TableItem>
                      <span>{key.expires}</span>
                    </TableItem>
                  </td>
                  <td>
                    <TableItem>
                      <Status active={key.status.toLowerCase() === 'active'}>
                        <span>{key.status}</span>
                      </Status>
                    </TableItem>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default withToasts(ApiKeyList);
