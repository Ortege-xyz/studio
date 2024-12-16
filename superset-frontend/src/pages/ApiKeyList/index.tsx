import { SupersetClient, t } from '@superset-ui/core';
import Button from 'src/components/Button';
import SubMenu from 'src/features/home/SubMenu';
import withToasts, { useToasts } from 'src/components/MessageToasts/withToasts';
import { Card, Status, Table, TableItem, Text } from './styled';
import { useEffect, useState } from 'react';
import { createErrorHandler } from 'src/views/CRUD/utils';
import { ApiToken, useGetApiKeysTokens } from './hooks';
import Loading from 'src/components/Loading';

function ApiKeyList() {
  const [keys, setKeys] = useState<ApiToken[]>([]);
  const { isLoading, error, fetchData, result } = useGetApiKeysTokens();
  const { addSuccessToast, addDangerToast } = useToasts();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setKeys(result);
  }, [result]);

  useEffect(() => {
    if (error) {
      addDangerToast(error);
    }
  }, [error]);

  const current_plan = 'Free tier';

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addSuccessToast('Copied the API Key.');
  };

  function showKey(index: number) {
    const key = keys[index];
    key.show = !key.show;
    const newKeys = [...keys];
    newKeys[index] = key;
    setKeys(newKeys);
  }

  function handleGenerateNewToken() {
    return SupersetClient.post({
      endpoint: `/api/v1/apikeys/`,
      jsonPayload: {
        username: '',
        password: '',
      },
    }).then(
      response => {
        console.log({ response });
        fetchData();
        addSuccessToast(t(`Created new Token`));
      },
      createErrorHandler(errMsg =>
        addDangerToast(t('There was an issue creating the token: %s', errMsg)),
      ),
    );
  }

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
          onClick={handleGenerateNewToken}
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
            {isLoading ? (
              <div>
                <Loading position="inline-centered" />
                <span>{t('Loading')}</span>
              </div>
            ) : (
              keys.map((key, index) => {
                return (
                  <tr key={index}>
                    <td style={{ width: '30vw' }}>
                      <TableItem>
                        <span>
                          {key.show
                            ? `${key.token.substring(0, 71)}...`
                            : '********'}
                        </span>
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
                        <span>{key.created_at}</span>
                      </TableItem>
                    </td>
                    <td>
                      <TableItem>
                        <span>{key.expires_at}</span>
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
              })
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default withToasts(ApiKeyList);
