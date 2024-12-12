import { styled } from '@superset-ui/core';

export const Card = styled.div`
  margin: 0px 16px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  background-color: white;
  padding: 8px 16px;
`;

export const Text = styled.span`
    font-size: 16px;
    font-weight: 800;
`

export const Table = styled.table`
    th {
        background: ${({theme}) => theme.colors.grayscale.light4};
        span {
            white-space: nowrap;
            display: flex;
            align-items: center;
            line-height: 2;
            font-size: 14px;
            font-weight: 800;
            color: ${({theme}) => theme.colors.grayscale.base};
            padding: 8px;
        }
    }

    tr {
        border-bottom: 1px solid ${({theme}) => theme.colors.grayscale.light4};

        span {
            font-weight: 600;
        }
    }
`

export const TableItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;

    text-overflow: ellipsis;
`

export const Status = styled.div<{ active?: boolean; }>`
    padding: 4px;
    border-radius: 4px;
    width: 100px;
    display: flex;
    justify-content: center;
    color: #fff;

    background-color: ${({theme, active}) => active ? theme.colors.success.base : theme.colors.error.base};
`