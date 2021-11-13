const Password = require("secure-random-password");
const Fs = require("fs");

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

class PasswordMap
{
    static FILENAME = "./passwd-stack.map";

    static SIZE = 5120;

    constructor() {
        try {
            this.fe = Fs.readFileSync(PasswordMap.FILENAME, "ascii");
        }
        catch(err) {
            if(err.code == "ENOENT") {
                var pw = Password.randomString(
                    {
                        characters: [Password.lower, Password.upper, Password.digits, '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{}~'],
                        length: PasswordMap.SIZE
                    }
                );
                var length = between(PasswordMap.SIZE / 3, PasswordMap.SIZE),
                    index = between(1, PasswordMap.SIZE);

                this.fe = this.save(pw, length, index);
                return;
            }
            throw(err);
        }
    }

    static SEPARATOR = "|";

    save(password, length, index) {
        var offset = between(PasswordMap.SIZE / 5, PasswordMap.SIZE),
            combine = PasswordMap.SEPARATOR
                      + [ Buffer.from(length + "").toString("base64"),
                            Buffer.from(index + "").toString("base64") ].join(PasswordMap.SEPARATOR)
                      + PasswordMap.SEPARATOR;

        Fs.writeFileSync(PasswordMap.FILENAME, password.substring(0, offset)
                                        + combine
                                        + password.substring(offset)
                        );
        return PasswordMap.FILENAME, password.substring(0, offset)
            + combine
            + password.substring(offset);
    }

    restore() {
        var a = this.fe.split(PasswordMap.SEPARATOR),
            b = {
                  l: Buffer.from(a[1], "base64").toString("ascii") * 1,
                  i: Buffer.from(a[2], "base64").toString("ascii") * 1,
                  p: a[0] + a[3]
                };
        return b;
    }
}

var p = new PasswordMap();

module.exports = {
    GetSecretInfo: () => p.restore(),
    GetSecretKey: (n) => {
        var v = p.restore();

        return v.p
            .substring(v.i, v.l)
            .substring(0, n);
    }
}
