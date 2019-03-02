/**
 * Propotional Font Display blocks
 */
//% weight=100 color=#0fbc11 icon="\u270f" block="Proportional Font"
namespace profont {
    declare const enum mojiSHift {
        Alfa = 0,
        Kana = 1,
        Kanji = 2
    }
    let rotate: number = 0
    let scroleSpeed: number = 200
    let yose: number = -1
    let kanaShift: number = 0	//0:Alfa,1:Kana,2:Kanji
    /**
     * TODO:文字列を表示する
     * @param pStr 文字列。, eg: "ABCDabcd"
     */
    //% block
    export function showString(pStr: string): void {
        const AlfaFont: string = "0    M    H0H  :O:O::MEG:IB49C:EE:1H    >A   A>   :4:  4>4  12   44   2    248  >A>  9O1  CE9  AE;  L4O  MEB  >E2  @CL  :E:  9E>  :    1:   4:A  ::   A:4  @E8  >AEB>?D?  OE:  >AA  OA>  OEA  OD@  >E6  O4O  AOA  2AN  O<C  O11  O8O  O>O  OAO  OD8  >C?  OD;  9EB  @O@  O1O  N1N  O2O  K4K  H7H  CEI  OA   842  AO   8@8  111  @8   7:7  O52  699  25O  >E9  4?D  9E:  O43  ;    11F  O25  N11  ?4?  ?87  696  ?:4  4:?  788  5=:  4?5  >1?  >1>  ?2?  969  =3<  ;=9  4OA  O    AO4  4848 0    "
        const KanaFont: string = "0    252  N@@  11?  21   04   @EEN 8?:< 1278 4=6  575  56?4 4?46 5571 EEO  4524 4444 AFDH 44?@ <I>  AOA  9:O8 9N9> :O:  8ABL 4I>8 AAAO 8M9N8EE2L ABDJA8N9= @92L 9IFL 5END HI1N 5EF4 O42  99N8 1AA1 AEBM 9:K:=112L 1N0L3N999 AABL 6842 ;8O8;DBEH EEE1 3=A531:4J DOEE 8O:< AAO1 EEEO EEEF L11N O0O2 O124 OAAO HAAN AA2L HH   8D8  "
        const KanjiFont: string = "=G4G8OEO  1NDO 92L2956O:A9:O:95;O;519O91"
        let i: number; let j: number; let k: number
        let lines: number[] = []
        let charCode: number
        let Font: string

        for (i = 0; i < pStr.length; i++) {
            charCode = pStr.charCodeAt(i) & 0xff
            if ((charCode >= 0x20) && (charCode <= 0x5f))
                Font = trim(AlfaFont.substr((charCode - 0x20) * 5, 5));
            else if ((kanaShift == mojiSHift.Alfa) && (charCode >= 0x60) && (charCode <= 0x7e))
                Font = trim(AlfaFont.substr((charCode - 0x20) * 5, 5));
            else if ((kanaShift == mojiSHift.Kana) && (charCode >= 0x60) && (charCode <= 0xa0))
                Font = trim(KanaFont.substr((charCode - 0x60) * 5, 5));
            else if ((kanaShift == mojiSHift.Kanji) && (charCode >= 0x60) && (charCode <= 0x6f))
                Font = trim(KanjiFont.substr((charCode - 0x60) * 5, 5));
            else
                Font = ""
            if (Font != "") {
                if (pStr.length == 1) {
                    if (Font.length < 5 && yose != -1) {
                        if (yose == 0) {
                            if (Font.length < 4) lines.push(0)
                            if (Font.length < 2) lines.push(0)
                        } else {
                            for (k = 5; k > Font.length; k--) {
                                lines.push(0)
                            }
                        }
                    }
                } else {
                    if ((charCode != 0x9e) && (charCode != 0x9f)) lines.push(0);
                }
                for (k = 0; k < Font.length; k++) {
                    lines.push(Font.charCodeAt(k) - 0x30)
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
                    if ((lines[i] >>> (4 - j) & 0x01) != 0) led.plot(i, j)
                    else led.unplot(i, j)
                }
            }
        } else {
            for (i = 0; i < 5; i++) lines.push(0)	//区切りを追加する
            for (i = 0; i < lines.length; i++) {
                scrollScreen(-1)
                for (j = 0; j < 5; j++) {
                    if ((lines[i] >>> (4 - j) & 0x01) != 0) led.plot(4, j)
                    else led.unplot(4, j)
                }
                basic.pause(scroleSpeed)
            }
        }
    }
    /**
     * スペースを取り除く
     */
    function trim(s: string): string {
        for(let i=s.length-1;i>=0;i--){
            if(s.substr(i,1)!=" ") return s.substr(0,i+1)
        }
        return s.substr(0,1)
    }
    /**
     * TODO:数字を表示する
     * @param n 数値。, eg: 500
     */
    //% block
    export function showNumber(n: number): void {
        showString(Math.roundWithPrecision(n, 2).toString())
    }
    /**
     * TODO:時刻を表示する
     * @param h 時。, eg: 3
     * @param m 分。, eg: 26
     */
    //% block
    export function showTime(h: number, m: number): void {
        showString(h.toString() + ":" + (m < 10 ? "0" : "") + m.toString())
    }
    /**
     * TODO:日付を表示する
     * @param m 月。, eg: 3
     * @param d 日。, eg: 14
     */
    //% block
    export function showDate(m: number, d: number): void {
        let svSHift=getShift()
        setShift(shiftKanji())  // 漢字モードにする
        showString(m.toString() + "b" + (d < 10 ? "0" : "") + d.toString() + "a")
        setShift(svSHift)  // シフト状態を元に戻す
    }
    /**
     * TODO:曜日を表示する
     * @param w 曜日。, eg: 3
     */
    //% block
    export function showWeekday(w: number): void {
        let weekday: string
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
        showString("\n" + weekday + "\b")
    }
    /**
     * TODO:スクリーンをスクロールする
     * @param n スクロール桁数。, eg: -1
     */
    //% block
    export function scrollScreen(n: number): void {
        if ((n <= -5) || (n >= 5)) {
            basic.clearScreen()
            return
        } else if (n == 0) {
            return
        } else if (n < 0) {
            for (let i = 0; i <= 5 + n; i++) {
                for (let j = 0; j < 5; j++) {
                    if (led.point(i - n, j)) {
                        led.plot(i, j)
                    } else {
                        led.unplot(i, j)
                    }
                }
            }
        } else {
            for (let i = 4; i >= (n - 1); i--) {
                for (let j = 0; j < 5; j++) {
                    if (led.point(i - n, j)) {
                        led.plot(i, j)
                    } else {
                        led.unplot(i, j)
                    }
                }
            }
        }
    }
    /**
     * TODO:回転方向を設定する
     * @param r 数値。, eg: -90
     */
    //% block
    export function setRotate(r: number): void {
        rotate = r
    }
    /**
     * TODO:スクロール速度を設定する
     * @param ss 数値。, eg: 100
     */
    //% block
    export function setScroleSpeed(ss: number): void {
        scroleSpeed = ss
    }
    /**
     * TODO:寄せを設定する
     * @param y 数値。, eg: 0
     */
    //% block
    export function setYose(y: number): void {
        yose = 1
    }
    /**
     * TODO:文字シフトを変更する
     * @param s 数値。, eg: 0
     */
    //% block
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
    //% block
    export function getShift():string{
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
    //% block
    export function shiftAlfa(): string {
        return "\b"
    }
    /**
     * TODO:カナシフトコード
     */
    //% block
    export function shiftKana(): string {
        return "\t"
    }
    /**
     * TODO:漢字シフトコード
     */
    //% block
    export function shiftKanji(): string {
        return "\n"
    }
    /**
     * TODO: 2桁の数値を表示する
     * @param n 表示する数値。, eg: 32
     */
    //% blockId="show number 2digits" block="show a number 2digitsr %n"
    //% weight=100 blockGap=8
    export function showNumber2(n: number): void {
        const font: number[] = [1023, 31, 765, 703, 927, 951, 1015, 636, 891, 959]
        let dfont: number
        let wn = Math.abs(n)
        if (wn > 99) {
            led.plot(0, 0)
            return
        }
        led.unplot(2, 0)
        led.unplot(2, 1)
        if (n < 0) led.plot(2, 2); else led.unplot(2, 2);
        led.unplot(2, 3)
        led.unplot(2, 4)

        dfont = font[Math.trunc(wn / 10)]
        for (let i = 0; i < 5; i++) {
            if ((dfont >> (9 - i) & 0x01) == 0x01) {
                led.plot(0, i)
            } else {
                led.unplot(0, i)
            }
            if ((dfont >> (4 - i) & 0x01) == 0x01) {
                led.plot(1, i)
            } else {
                led.unplot(1, i)
            }
        }
        dfont = font[wn % 10]
        for (let i = 0; i < 5; i++) {
            if ((dfont >> (9 - i) & 0x01) == 0x01) {
                led.plot(3, i)
            } else {
                led.unplot(3, i)
            }
            if ((dfont >> (4 - i) & 0x01) == 0x01) {
                led.plot(4, i)
            } else {
                led.unplot(4, i)
            }
        }
    }
    /**
     * TODO: 数値をそろばん形式で表示する
     * @param n 表示する数値。, eg: 2048
     * @param s 表示開始位置。, eg: 0
     * @param w 表示桁数。, eg: 4
     */
    //% blockId="show_soroban_number" block="show a number %n start %s width %w"
    //% weight=100 blockGap=8
    export function showSorobanNumber(n: number, s: number = 0, w: number = 5): void {
        let wn = Math.abs(n)
        for (let i = s + w - 1; i >= s; i--) {
            let d = wn % 10
            if (wn == 0) {
                led.unplot(i, 0)
                led.unplot(i, 1)
                if (n <= 0) led.plot(i, 2); else led.unplot(i, 2);
                led.unplot(i, 3)
                led.unplot(i, 4)
            } else {
                if (d >= 5) led.plot(i, 0); else led.unplot(i, 0);
                d = d % 5
                if (d >= 4) led.plot(i, 1); else led.unplot(i, 1)
                if (d >= 3) led.plot(i, 2); else led.unplot(i, 2)
                if (d >= 2) led.plot(i, 3); else led.unplot(i, 3)
                if (d >= 1) led.plot(i, 4); else led.unplot(i, 4)
                wn = Math.trunc(wn / 10)
            }
        }
    }
    /**
     * TODO:数値を16進形式で表示する
     * @param n 数値。, eg: 0xab30
     */
    //% block
    export function showHex(n: number): void {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 4; y++) {
                if ((n & 1 << (x * 4 + y)) != 0) {
                    led.plot(4 - y, 4 - x)
                } else {
                    led.unplot(4 - y, 4 - x)
                }
            }
        }
    }
}
