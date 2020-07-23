class toMoneyHelper {
  REG_NUMBER = /^([+-])?0*(\d+)(\.(\d+))?$/;
  CH = '零壹贰叁肆伍陆柒捌玖';
  CHU = '个拾佰仟万亿';
  CHF = '负';
  CHD = '点';
  MT = '人民币';
  MZ = '整';
  MU = '元角分';
  /**
   * 分板数字字符串
   *
   * @param {string} num NumberString
   * @returns object
   */
  getNumbResult(num: number): any {
    let result = toMoneyObj.REG_NUMBER.exec(num.toString());
    if (result) {
      return {
        int: result[2],
        decimal: result[4],
        minus: result[1] == '-',
        num: result.slice(1, 3).join(''),
      };
    }
  }
  /**
   * 清理多余"零"
   *
   * @param {any} str
   * @param {any} zero "零"字符
   * @param {any} type 清理模式 ^ - 开头, $ - 结尾, nto1 - 多个连续变一个
   * @returns
   */
  zeroComm(str: string, char_0: string, type?: string) {
    if (str == null) {
      return '';
    }
    let reg0 = ~'*.?+$^[](){}|\\/'.indexOf(char_0) ? '\\' + char_0 : char_0;
    let arg_s = new RegExp('^' + reg0 + '+'),
      arg_e = new RegExp(reg0 + '+$'),
      arg_d = new RegExp(reg0 + '{2}', 'g');
    str = str.toString();
    if (type == '^') {
      str = str.replace(arg_s, '');
    }
    if (!type || type == '$') {
      str = str.replace(arg_e, '');
    }
    if (!type || type == 'nto1') {
      str = str.replace(arg_d, char_0);
    }
    return str;
  }
  /**
   *递归数字转换成大写并进行拼接
   * @param _int 转换的数字
   * @param options 转换配置
   * @param n0 // 修整字符
   */
  encodeInt(_int: string, options: { ww: boolean }, n0: string) {
    _int = toMoneyObj.getNumbResult((_int as any) as number).int;
    let int = '';
    let _length = _int.length;
    //一位整数
    if (_length == 1) {
      return toMoneyObj.CH.charAt(+_int);
    }
    if (_length <= 4) {
      //小于四位
      for (let i = 0, n = _length; n--;) {
        let _num = +_int.charAt(i);
        int += toMoneyObj.CH.charAt(_num);
        int += _num && n ? toMoneyObj.CHU.charAt(n) : '';
        i++;
      }
    } else {
      //大数递归
      let d = (_int.length / 4) >> 0,
        y = _int.length % 4;
      while (y == 0 || !toMoneyObj.CHU.charAt(3 + d)) {
        y += 4;
        d--;
      }
      int =
        toMoneyObj.encodeInt(_int.substr(0, y), options, n0) +
        toMoneyObj.CHU.charAt(3 + d) +
        (~_int.substr(y - 1, 2).indexOf('0') ? n0 : '') +
        toMoneyObj.encodeInt(_int.substr(y), options, n0);
    }
    int = toMoneyObj.zeroComm(int, n0); //修整零
    return int;
  }
  /**
   * 阿拉伯数字转中文数字
   *
   * @param {String} num 阿拉伯数字/字符串 , 科学记数法字符串
   * @param {Object} options 转换配置
   *         {
   *             ww: {万万化单位 | false}
   *         }
   * @returns String
   */
  clTransform(num: string, options?: { ww: boolean }) {
    let self = this;
    let result = toMoneyObj.getNumbResult((num as any) as number);
    if (!result) {
      return num;
    }
    options = options ? options : <{ ww: boolean }>{};
    let ch = toMoneyObj.CH, //数字
      CHU = toMoneyObj.CHU, //单位
      CHF = toMoneyObj.CHF || '', //负
      CHD = toMoneyObj.CHD || '', //点
      n0 = ch.charAt(0); //零
    let _int = result.int, //整数部分
      _decimal = result.decimal, //小数部分
      _minus = result.minus; //负数标识
    let int = '',
      dicimal = '',
      minus = _minus ? CHF : ''; //符号位

    //转换小数部分
    if (_decimal) {
      _decimal = toMoneyObj.zeroComm(_decimal, '0', '$'); //去除尾部0
      for (let x = 0; x < _decimal.length; x++) {
        dicimal += ch.charAt(+_decimal.charAt(x));
      }
      dicimal = dicimal ? CHD + dicimal : '';
    }

    //转换整数部分
    int = toMoneyObj.encodeInt(_int, options, n0); //转换整数

    //超级大数的万万化
    if (options.ww && CHU.length > 5) {
      let dw_w = CHU.charAt(4),
        dw_y = CHU.charAt(5);
      let lasty = int.lastIndexOf(dw_y);
      if (~lasty) {
        int =
          int.substring(0, lasty).replace(new RegExp(dw_y, 'g'), dw_w + dw_w) +
          int.substring(lasty);
      }
    }
    return minus + int + dicimal;
  }
  /**
   * 阿拉伯数字转金额
   *
   * @param {String} numMoney 阿拉伯数字/字符串 , 科学记数法字符串
   * @param {Object} options 转换配置
   *                         {
   *                             ww:{万万化开关 | true},
   *                             complete:{完整金额格式 | false},
   *                             outSymbol:{就否输出金额符号 | false}
   *                         }
   * @returns String
   */
  toMoney(
    numMoney: number | string,
    options: { ww: boolean; complete: boolean; outSymbol: boolean } = {
      ww: true, //"万万"化开关
      complete: false, // 输出完整金额开关,零角零分
      outSymbol: false, //是否显示人民币前缀
    },
  ) {
    let num: number;
    if (typeof numMoney == 'string' && !isNaN(Number(numMoney))) {
      num = Number(numMoney)
    }
    else if (typeof numMoney == 'number') {
      num = numMoney
    }
    else {
      return '';
    }

    let result = toMoneyObj.getNumbResult(num);
    let chZero = toMoneyObj.CH.charAt(0);
    if (!result) {
      return num;
    }
    let _num = result.num,
      _decimal = result.decimal || '';
    let tStr = options.outSymbol ? toMoneyObj.MT : '',
      zsStr = _decimal ? '' : toMoneyObj.MZ,
      xsStr = '';

    if (options.complete) {
      for (let i = 1; i < toMoneyObj.MU.length; i++) {
        xsStr +=
          toMoneyObj.clTransform.call(
            this,
            _decimal.charAt(i - 1) || '0',
            options,
          ) + toMoneyObj.MU.charAt(i);
      }
      zsStr =
        toMoneyObj.clTransform.call(this, _num, options) +
        toMoneyObj.MU.charAt(0);
    } else {
      _decimal = toMoneyObj.zeroComm(_decimal, '0', '$'); //去除尾部的0
      if (_decimal) {
        for (let i = 0; i < toMoneyObj.MU.length - 1; i++) {
          if (_decimal.charAt(i) && _decimal.charAt(i) != '0') {
            xsStr +=
              toMoneyObj.clTransform.call(this, _decimal.charAt(i), options) +
              toMoneyObj.MU.charAt(i + 1);
          }
          if (_decimal.charAt(i) === '0') {
            if (i != 0 || _num != '0') {
              xsStr += chZero;
            }
          }
        }
      }
      if (_num != '0' || zsStr || !xsStr) {
        zsStr =
          toMoneyObj.clTransform.call(this, _num, options) +
          toMoneyObj.MU.charAt(0) +
          zsStr;
      }
    }
    return tStr + zsStr + xsStr;
  }
}
let toMoneyObj = new toMoneyHelper();
export const { toMoney: hConvertAmount } = toMoneyObj;
