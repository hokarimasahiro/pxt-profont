/**
 * Propotional Font Display blocks
 */
enum rotate {
    //% block="top"
    top = 0,
    //% block="left"
    left = 1,
    //% block="under"
    under = 2,
    //% block="right"
    right = 3
}
//% weight=100 color=#0fbc11 icon="\u270f" block="Proportional Font"
namespace profont {
    //% shim=profont::getAlph
    function getAlph(n: number): number {
        return 0;
    }

    //% shim=profont::getKana
    function getKana(n: number): number {
        return 0;
    }

    //% shim=profont::getKanji
    function getKanji(n: number): number {
        return 0;
    }

    declare const enum mojiSHift {
        Alfa = 0,
        Kana = 1,
        Kanji = 2
    }
    let rotate: number = 0      // 0:top,1:left,2:under,3:right
    let scroleSpeed: number = 200
    let yose: number = -1       //-1:left,0:center,1:right
    let kanaShift: number = 0	//0:Alfa,1:Kana,2:Kanji
    function getFont(charCode: number): number {

        let fontNum: number
        let fontStr: string

        if ((charCode >= 0x20) && (charCode <= 0x5f))
            fontNum = getAlph(charCode - 0x20);
        else if ((kanaShift == mojiSHift.Alfa) && (charCode >= 0x60) && (charCode <= 0x7e))
            fontNum = getAlph(charCode - 0x20);
        else if ((kanaShift == mojiSHift.Kana) && (charCode >= 0x60) && (charCode <= 0xa0))
            fontNum = getKana(charCode - 0x60);
        else if ((kanaShift == mojiSHift.Kanji) && (charCode >= 0x60) && (charCode <= 0x6f))
            fontNum = getKanji(charCode - 0x60);
        else
            return -1;

        return fontNum;
    }
    /**
     * TODO:文字列を表示する
     * @param pStr 文字列。, eg: "ABCDabcd"
     */
    //% blockId="文字列を表示" block="文字列を表示 %pStr"
    //% weight=100 blockGap=8
    export function showString(pStr: string): void {
        let i: number; let j: number; let k: number
        let lines: number[] = []
        let charCode: number
        let font: number
        let fontWidth: number

        for (i = 0; i < pStr.length; i++) {
            charCode = pStr.charCodeAt(i) & 0xff
            font = getFont(charCode)
            if (font != -1) {
                if (font == 0) fontWidth = 1;
                if ((font & (0x1ffffff << 5)) == 0) fontWidth = 1;
                else if ((font & (0x1ffffff << 10)) == 0) fontWidth = 2;
                else if ((font & (0x1ffffff << 15)) == 0) fontWidth = 3;
                else if ((font & (0x1ffffff << 5)) == 0) fontWidth = 4;
                else fontWidth = 5;

                if (pStr.length == 1) {
                    if (fontWidth < 5 && yose != -1) {
                        if (yose == 0) {
                            if (fontWidth < 4) lines.push(0)
                            if (fontWidth < 2) lines.push(0)
                        } else {
                            for (k = 5; k > fontWidth; k--) {
                                lines.push(0)
                            }
                        }
                    }
                } else {
                    if ((charCode != 0x9e) && (charCode != 0x9f)) lines.push(0);
                }
                for (k = 0; k < fontWidth; k++) {
                    lines.push((font >> (((fontWidth - 1) - k) * 5)) & 0x1f)
                }
            } else {
                switch (pStr.charCodeAt(i)) {
                    case shiftAlfa().charCodeAt(0):	// \b
                        kanaShift = mojiSHift.Alfa
                        break
                    case shiftKana().charCodeAt(0):	// \t
                        kanaShift = mojiSHift.Kana
                        break
                    case shiftKanji().charCodeAt(0):	// \n
                        kanaShift = mojiSHift.Kanji
                        break
                }
            }
        }
        if (pStr.length == 1) {
            basic.clearScreen()
            for (i = 0; i < lines.length; i++) {
                for (j = 0; j < 5; j++) {
                    if ((lines[i] >>> (4 - j) & 0x01) != 0) plot(i, j)
                    else unplot(i, j)
                }
            }
        } else {
            for (i = 0; i < 5; i++) lines.push(0)	//区切りを追加する
            for (i = 0; i < lines.length; i++) {
                scrollScreen(-1)
                for (j = 0; j < 5; j++) {
                    if ((lines[i] >>> (4 - j) & 0x01) != 0) plot(4, j)
                    else unplot(4, j)
                }
                basic.pause(scroleSpeed)
            }
        }
    }
    /**
     * スペースを取り除く
     */
    function trim(s: string): string {
        for (let i = s.length - 1; i >= 0; i--) {
            if (s.substr(i, 1) != " ") return s.substr(0, i + 1)
        }
        return s.substr(0, 1)
    }
    /**
     * TODO:数字を表示する
     * @param n 数値。, eg: 500
     */
    //% blockId="数を表示" block="数を表示 %n"
    //% weight=98 blockGap=8
    export function showNumber(n: number): void {
        showString(Math.roundWithPrecision(n, 2).toString())
    }
    /**
     * TODO:時刻を表示する
     * @param h 時。, eg: 7
     * @param m 分。, eg: 30
     */
    //% blockId="時刻を表示" block="時刻を表示 %h:%m"
    //% weight=96 blockGap=8
    export function showTime(h: number, m: number): void {
        showString(h.toString() + ":" + (m < 10 ? "0" : "") + m.toString())
    }
    /**
     * TODO:日付を表示する
     * @param m 月。, eg: 3
     * @param d 日。, eg: 14
     */
    //% blockId="日付を表示" block="日付を表示 %m月%d日"
    //% weight=94 blockGap=8
    export function showDate(m: number, d: number): void {
        let svSHift = getShift()
        setShift(shiftKanji())  // 漢字モードにする
        showString(m.toString() + "b" + (d < 10 ? "0" : "") + d.toString() + "a")
        setShift(svSHift)  // シフト状態を元に戻す
    }
    /**
     * TODO:曜日を表示する
     * @param w 曜日。, eg: 3
     */
    //% blockId="曜日を表示" block="曜日を表示 %w"
    //% weight=92 blockGap=8
    export function showWeekday(w: number): void {
        let weekday: string
        let svShift = getShift()
        switch (w) {
            case 0:
                weekday = "a"
                break
            case 1:
                weekday = "b"
                break
            case 2:
                weekday = "c"
                break
            case 3:
                weekday = "d"
                break
            case 4:
                weekday = "e"
                break
            case 5:
                weekday = "f"
                break
            case 6:
                weekday = "g"
                break
        }
        setYose(0)
        setShift(shiftKanji())
        showString(weekday)
        setShift(svShift)
    }
    /**
     * TODO:スクリーンをスクロールする
     * @param n スクロール桁数。, eg: -1
     */
    //% blockId="スクロールする" block="スクロールする %n"
    //% weight=90 blockGap=8
    function scrollScreen(n: number): void {
        if ((n <= -5) || (n >= 5)) {
            basic.clearScreen()
            return
        } else if (n == 0) {
            return
        } else if (n < 0) {
            for (let i = 0; i <= 5 + n; i++) {
                for (let j = 0; j < 5; j++) {
                    if (point(i - n, j)) {
                        plot(i, j)
                    } else {
                        unplot(i, j)
                    }
                }
            }
        } else {
            for (let i = 4; i >= (n - 1); i--) {
                for (let j = 0; j < 5; j++) {
                    if (point(i - n, j)) {
                        plot(i, j)
                    } else {
                        unplot(i, j)
                    }
                }
            }
        }
    }
    /**
     * TODO:１列表示する
     * @param n 表示データ。, eg: 0x01001
     */
    //% blockId="１列表示する" block="１列表示する %n"
    //% weight=88 blockGap=8
    function display1line(n: number): void {
        if ((n <= -5) || (n >= 5)) {
            basic.clearScreen()
            return
        } else if (n == 0) {
            return
        } else if (n < 0) {
            for (let i = 0; i <= 5 + n; i++) {
                for (let j = 0; j < 5; j++) {
                    if (point(i - n, j)) {
                        plot(i, j)
                    } else {
                        unplot(i, j)
                    }
                }
            }
        } else {
            for (let i = 4; i >= (n - 1); i--) {
                for (let j = 0; j < 5; j++) {
                    if (point(i - n, j)) {
                        plot(i, j)
                    } else {
                        unplot(i, j)
                    }
                }
            }
        }
    }
    /**
     * TODO:LEDを点ける
     * @param x x座標。, eg: 1
     * @param y y座標。, eg: 3
     */
    //% blockId="plot" block="plot %x %y"
    //% weight=88 blockGap=8
    export function plot(x: number, y: number): void {
        switch (rotate) {
            case 0:
                led.plot(x, y); break;
            case 1:
                led.plot(y, 4 - x); break;
            case 2:
                led.plot(4 - x, 4 - y); break;
            case 3:
                led.plot(4 - y, x); break;
            default:
                led.plot(x, y); break;
        }
    }
    /**
     * TODO:LEDを消す
     * @param x x座標。, eg: 1
     * @param y y座標。, eg: 3
     */
    //% blockId="unplot" block="unplot %x %y"
    //% weight=88 blockGap=8
    export function unplot(x: number, y: number): void {
        switch (rotate) {
            case 0:
                led.unplot(x, y); break;
            case 1:
                led.unplot(y, 4 - x); break;
            case 2:
                led.unplot(4 - x, 4 - y); break;
            case 3:
                led.unplot(4 - y, x); break;
            default:
                led.unplot(x, y); break;
        }
    }
    /**
     * TODO:LEDの状態を取り出す
     * @param x x座標。, eg: 1
     * @param y y座標。, eg: 3
     */
    //% blockId="point" block="point %x %y"
    //% weight=88 blockGap=8
    export function point(x: number, y: number): boolean {
        switch (rotate) {
            case 0:
                return led.point(x, y)
            case 1:
                return led.point(y, 4 - x)
            case 2:
                return led.point(4 - x, 4 - y)
            case 3:
                return led.point(4 - y, x)
            default:
                return led.point(x, y)
        }
        return false
    }
    /**
     * TODO:回転方向を設定する
     * @param r rotate。, eg: left
     */
    //% blockId="回転方向" block="回転方向 %r"
    //% weight=90 blockGap=8
    export function setRotatation(r: rotate): void {
        rotate = r
    }
    /**
     * TODO:スクロール速度を設定する
     * @param ss 数値。, eg: 100
     */
    //% blockId="スクロール速度" block="スクロール速度 %ss"
    //% weight=88 blockGap=8
    export function setScroleSpeed(ss: number): void {
        scroleSpeed = ss
    }
    /**
     * TODO:寄せを設定する
     * @param y 数値。, eg: 0
     */
    //% blockId="寄せ" block="寄せ %y"
    //% weight=86 blockGap=8
    export function setYose(y: number): void {
        yose = y
    }
    /**
     * TODO:文字シフトを変更する
     * @param s シフトコード。, eg: \b
     */
    //% blockId="文字種類" block="文字種類 %s"
    //% weight=84 blockGap=8
    export function setShift(s: string): void {
        switch (s.charCodeAt(0)) {
            case shiftAlfa().charCodeAt(0):	// \b
                kanaShift = mojiSHift.Alfa
                break
            case shiftKana().charCodeAt(0):	// \t
                kanaShift = mojiSHift.Kana
                break
            case shiftKanji().charCodeAt(0):	// \n
                kanaShift = mojiSHift.Kanji
                break
        }
    }
    /**
     * TODO:文字シフトを取得する
     */
    //% blockId="get Shiftmode" block="get Shiftmode"
    //% weight=82 blockGap=8
    function getShift(): string {
        switch (kanaShift) {
            case mojiSHift.Alfa:	// \b
                return shiftAlfa()
            case mojiSHift.Kana:	// \t
                return shiftKana()
            case mojiSHift.Kanji:	// \n
                return shiftKanji()
        }
        return shiftAlfa()
    }
    /**
     * TODO:英字シフトコード
     */
    //% blockId="英小文字" block="英小文字"
    //% weight=80 blockGap=8
    export function shiftAlfa(): string {
        return "\t"
    }
    /**
     * TODO:カナシフトコード
     */
    //% blockId="カタカナ" block="カタカナ"
    //% weight=78 blockGap=8
    export function shiftKana(): string {
        return "\v"
    }
    /**
     * TODO:漢字シフトコード
     */
    //% blockId="shiftKanji" block="shiftKanji"
    //% weight=76 blockGap=8
    function shiftKanji(): string {
        return "\f"
    }
    /**
     * TODO: 2桁の数値を表示する
     * @param n 表示する数値。, eg: 32
     */
    //% blockId="2桁の数を表示" block="2桁の数を表示 %n"
    //% weight=60 blockGap=8
    export function showNumber2(n: number): void {
        const font: number[] = [1023, 31, 765, 703, 927, 951, 1015, 636, 891, 959]
        let dfont: number
        let wn = Math.abs(n)
        if (wn > 99) {
            plot(0, 0)
            return
        }
        unplot(2, 0)
        unplot(2, 1)
        if (n < 0) led.plot(2, 2); else led.unplot(2, 2);
        unplot(2, 3)
        unplot(2, 4)

        dfont = font[Math.trunc(wn / 10)]
        for (let i = 0; i < 5; i++) {
            if ((dfont >> (9 - i) & 0x01) == 0x01) {
                plot(0, i)
            } else {
                unplot(0, i)
            }
            if ((dfont >> (4 - i) & 0x01) == 0x01) {
                plot(1, i)
            } else {
                unplot(1, i)
            }
        }
        dfont = font[wn % 10]
        for (let i = 0; i < 5; i++) {
            if ((dfont >> (9 - i) & 0x01) == 0x01) {
                plot(3, i)
            } else {
                unplot(3, i)
            }
            if ((dfont >> (4 - i) & 0x01) == 0x01) {
                plot(4, i)
            } else {
                unplot(4, i)
            }
        }
    }
    /**
     * TODO: 数値をそろばん形式で表示する
     * @param n 表示する数値。, eg: 2048
     * @param s 表示開始位置。, eg: 0
     * @param w 表示桁数。, eg: 4
     */
    //% blockId="そろばん形式で数を表示" block="そろばん形式で数を表示 %n 表示位置 %s 桁数 %w"
    //% weight=50 blockGap=8
    export function showSorobanNumber(n: number, s: number = 0, w: number = 5): void {
        let wn = Math.abs(n)
        for (let i = s + w - 1; i >= s; i--) {
            let d = wn % 10
            if (wn == 0) {
                unplot(i, 0)
                unplot(i, 1)
                if (n <= 0) plot(i, 2); else unplot(i, 2);
                unplot(i, 3)
                unplot(i, 4)
            } else {
                if (d >= 5) plot(i, 0); else unplot(i, 0);
                d = d % 5
                if (d >= 4) plot(i, 1); else unplot(i, 1)
                if (d >= 3) plot(i, 2); else unplot(i, 2)
                if (d >= 2) plot(i, 3); else unplot(i, 3)
                if (d >= 1) plot(i, 4); else unplot(i, 4)
                wn = Math.trunc(wn / 10)
            }
        }
    }
}
