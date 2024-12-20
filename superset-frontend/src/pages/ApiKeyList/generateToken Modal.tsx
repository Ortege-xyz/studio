import { css, styled, SupersetClient, t } from '@superset-ui/core';
import { useCallback, useEffect, useState } from 'react';
import { LabeledErrorBoundInput } from 'src/components/Form';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import Modal from 'src/components/Modal';
import { createErrorHandler } from 'src/views/CRUD/utils';

const noMargins = css`
  margin: 0;

  .ant-input {
    margin: 0;
  }
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.gridUnit}px;
  margin-bottom: ${({ theme }) => theme.gridUnit * 4}px;

  .input-container {
    display: flex;
    align-items: center;

    > div {
      width: 100%;
    }
  }

  input,
  textarea {
    flex: 1 1 auto;
  }

  .required {
    margin-left: ${({ theme }) => theme.gridUnit / 2}px;
    color: ${({ theme }) => theme.colors.error.base};
  }
`;

interface CreateTokenModalProps {
  show: boolean;
  onHide: () => void;
  refetchData: () => void;
}

export function GenerateTokenModal({
  show,
  onHide,
  refetchData,
}: CreateTokenModalProps) {
  const [disableButton, setDisableButton] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { addSuccessToast, addDangerToast } = useToasts();

  useEffect(() => {
    if(email.length === 0 || password.length === 0){
        setDisableButton(true)
    } else {
        setDisableButton(false)
    }
  }, [email, password]);

  const onClose = useCallback(() => {
    onHide();
    setEmail('');
    setPassword('');
  }, [onHide, setEmail, setPassword]);

  function onCreateNewToken() {
    SupersetClient.post({
      endpoint: `/api/v1/apikeys/`,
      jsonPayload: {
        username: email,
        password: password,
      },
    }).then(
      () => {
        addSuccessToast(t(`Generate new Token`));
        refetchData();
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
    onClose();
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      title={<h4>Create new token</h4>}
      primaryButtonName="Create"
      onHandledPrimaryAction={onCreateNewToken}
      disablePrimaryButton={disableButton}
    >
      <div>
        <StyledInputContainer>
          <LabeledErrorBoundInput
            id="email"
            name="email"
            className="labeled-input"
            value={email}
            required
            type="email"
            validationMethods={{
              onChange: ({ target }: { target: HTMLInputElement }) =>
                setEmail(target.value),
            }}
            css={noMargins}
            label={t('Email')}
            tooltipText={t('The email used to login.')}
            hasTooltip
          />
        </StyledInputContainer>
        <StyledInputContainer>
          <LabeledErrorBoundInput
            id="password"
            name="password"
            className="labeled-input"
            value={password}
            required
            validationMethods={{
              onChange: ({ target }: { target: HTMLInputElement }) =>
                setPassword(target.value),
            }}
            css={noMargins}
            label={t('Password')}
            type="password"
            tooltipText={t('The password used to login.')}
            hasTooltip
          />
        </StyledInputContainer>
      </div>
    </Modal>
  );
}
