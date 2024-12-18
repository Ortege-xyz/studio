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

  function onRevokeToken(id: number) {
    return SupersetClient.post({
      endpoint: `/api/v1/apikeys/revoke/${id}`,
    }).then(
      () => {
        addSuccessToast(t(`Revoked token`));
        fetchData();
      },
      createErrorHandler(errMsg => {
        addDangerToast(t('There was an issue revoking the token: %s', errMsg));
        fetchData();
      }),
    );
  }

  function onDeleteToken(id: number) {
    return SupersetClient.delete({
      endpoint: `/api/v1/apikeys/${id}`,
    }).then(
      () => {
        addSuccessToast(t(`Deleted token`));
        fetchData();
      },
      createErrorHandler(errMsg => {
        addDangerToast(t('There was an issue deleting the token: %s', errMsg));
        fetchData();
      }),
    );
  }

  function onCreateNewToken() {
    return SupersetClient.post({
      endpoint: `/api/v1/apikeys/`,
      jsonPayload: {
        username: '',
        password: '',
      },
    }).then(
      () => {
        addSuccessToast(t(`Created new Token`));
        fetchData();
      },
      createErrorHandler(errMsg => {
        let message = null;
        if (
          typeof errMsg === 'string' &&
          errMsg?.startsWith('Error to generate new token:')
        ) {
          message = JSON.parse(
            errMsg.split('Error to generate new token: ')[1],
          ).error_description;
        } else {
          message = errMsg;
        }
        addDangerToast(t('There was an issue creating the token: %s', message));
      }),
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
          onClick={onCreateNewToken}
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
                          <Button
                            type="primary"
                            buttonStyle="danger"
                            onClick={() => onRevokeToken(key.id)}
                          >
                            <span>Revoke</span>
                          </Button>
                        )}
                        {key.status === 'Expired' && (
                          <Button
                            type="primary"
                            buttonStyle="danger"
                            onClick={() => onDeleteToken(key.id)}
                          >
                            <span>Delete</span>
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
