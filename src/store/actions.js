import {
  ajax
} from '../request/request';

export const UpdateUserData = 'UpdateUserData';

export function getUserData() {
  return function (dispatch) {
    return new Promise((resolve, reject) => {
      ajax(
        '/iyourcar_account/infocenter/myself',
      ).then(res => {
        dispatch({
          type: UpdateUserData,
          userData: res,
        });
        resolve()
      }).catch(e => {
        reject(e)
      })
    })
  };
}