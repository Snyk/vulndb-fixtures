const tape       = require('tape')
    , crypto     = require('crypto')
    , fs         = require('fs')
    , BufferList = require('./')

tape('single bytes from single buffer', function (t) {
  var bl = new BufferList()
  bl.append(new Buffer('abcd'))

  t.equal(bl.length, 4)

  t.equal(bl.get(0), 97)
  t.equal(bl.get(1), 98)
  t.equal(bl.get(2), 99)
  t.equal(bl.get(3), 100)

  t.end()
})

tape('single bytes from multiple buffers', function (t) {
  var bl = new BufferList()
  bl.append(new Buffer('abcd'))
  bl.append(new Buffer('efg'))
  bl.append(new Buffer('hi'))
  bl.append(new Buffer('j'))

  t.equal(bl.length, 10)

  t.equal(bl.get(0), 97)
  t.equal(bl.get(1), 98)
  t.equal(bl.get(2), 99)
  t.equal(bl.get(3), 100)
  t.equal(bl.get(4), 101)
  t.equal(bl.get(5), 102)
  t.equal(bl.get(6), 103)
  t.equal(bl.get(7), 104)
  t.equal(bl.get(8), 105)
  t.equal(bl.get(9), 106)
  t.end()
})

tape('multi bytes from single buffer', function (t) {
  var bl = new BufferList()
  bl.append(new Buffer('abcd'))

  t.equal(bl.length, 4)

  t.equal(bl.slice(0, 4).toString('ascii'), 'abcd')
  t.equal(bl.slice(0, 3).toString('ascii'), 'abc')
  t.equal(bl.slice(1, 4).toString('ascii'), 'bcd')

  t.end()
})

tape('multiple bytes from multiple buffers', function (t) {
  var bl = new BufferList()

  bl.append(new Buffer('abcd'))
  bl.append(new Buffer('efg'))
  bl.append(new Buffer('hi'))
  bl.append(new Buffer('j'))

  t.equal(bl.length, 10)

  t.equal(bl.slice(0, 10).toString('ascii'), 'abcdefghij')
  t.equal(bl.slice(3, 10).toString('ascii'), 'defghij')
  t.equal(bl.slice(3, 6).toString('ascii'), 'def')
  t.equal(bl.slice(3, 8).toString('ascii'), 'defgh')
  t.equal(bl.slice(5, 10).toString('ascii'), 'fghij')

  t.end()
})

tape('consuming from multiple buffers', function (t) {
  var bl = new BufferList()

  bl.append(new Buffer('abcd'))
  bl.append(new Buffer('efg'))
  bl.append(new Buffer('hi'))
  bl.append(new Buffer('j'))

  t.equal(bl.length, 10)

  t.equal(bl.slice(0, 10).toString('ascii'), 'abcdefghij')

  bl.consume(3)
  t.equal(bl.length, 7)
  t.equal(bl.slice(0, 7).toString('ascii'), 'defghij')

  bl.consume(2)
  t.equal(bl.length, 5)
  t.equal(bl.slice(0, 5).toString('ascii'), 'fghij')

  bl.consume(1)
  t.equal(bl.length, 4)
  t.equal(bl.slice(0, 4).toString('ascii'), 'ghij')

  bl.consume(1)
  t.equal(bl.length, 3)
  t.equal(bl.slice(0, 3).toString('ascii'), 'hij')

  bl.consume(2)
  t.equal(bl.length, 1)
  t.equal(bl.slice(0, 1).toString('ascii'), 'j')

  t.end()
})

tape('test readUInt8 / readInt8', function (t) {
  var buf1 = new Buffer(1)
    , buf2 = new Buffer(3)
    , buf3 = new Buffer(3)
    , bl  = new BufferList()

  buf2[1] = 0x3
  buf2[2] = 0x4
  buf3[0] = 0x23
  buf3[1] = 0x42

  bl.append(buf1)
  bl.append(buf2)
  bl.append(buf3)

  t.equal(bl.readUInt8(2), 0x3)
  t.equal(bl.readInt8(2), 0x3)
  t.equal(bl.readUInt8(3), 0x4)
  t.equal(bl.readInt8(3), 0x4)
  t.equal(bl.readUInt8(4), 0x23)
  t.equal(bl.readInt8(4), 0x23)
  t.equal(bl.readUInt8(5), 0x42)
  t.equal(bl.readInt8(5), 0x42)
  t.end()
})

tape('test readUInt16LE / readUInt16BE / readInt16LE / readInt16BE', function (t) {
  var buf1 = new Buffer(1)
    , buf2 = new Buffer(3)
    , buf3 = new Buffer(3)
    , bl   = new BufferList()

  buf2[1] = 0x3
  buf2[2] = 0x4
  buf3[0] = 0x23
  buf3[1] = 0x42

  bl.append(buf1)
  bl.append(buf2)
  bl.append(buf3)

  t.equal(bl.readUInt16BE(2), 0x0304)
  t.equal(bl.readUInt16LE(2), 0x0403)
  t.equal(bl.readInt16BE(2), 0x0304)
  t.equal(bl.readInt16LE(2), 0x0403)
  t.equal(bl.readUInt16BE(3), 0x0423)
  t.equal(bl.readUInt16LE(3), 0x2304)
  t.equal(bl.readInt16BE(3), 0x0423)
  t.equal(bl.readInt16LE(3), 0x2304)
  t.equal(bl.readUInt16BE(4), 0x2342)
  t.equal(bl.readUInt16LE(4), 0x4223)
  t.equal(bl.readInt16BE(4), 0x2342)
  t.equal(bl.readInt16LE(4), 0x4223)
  t.end()
})

tape('test readUInt32LE / readUInt32BE / readInt32LE / readInt32BE', function (t) {
  var buf1 = new Buffer(1)
    , buf2 = new Buffer(3)
    , buf3 = new Buffer(3)
    , bl   = new BufferList()

  buf2[1] = 0x3
  buf2[2] = 0x4
  buf3[0] = 0x23
  buf3[1] = 0x42

  bl.append(buf1)
  bl.append(buf2)
  bl.append(buf3)

  t.equal(bl.readUInt32BE(2), 0x03042342)
  t.equal(bl.readUInt32LE(2), 0x42230403)
  t.equal(bl.readInt32BE(2), 0x03042342)
  t.equal(bl.readInt32LE(2), 0x42230403)
  t.end()
})

tape('test readFloatLE / readFloatBE', function (t) {
  var buf1 = new Buffer(1)
    , buf2 = new Buffer(3)
    , buf3 = new Buffer(3)
    , bl   = new BufferList()

  buf2[1] = 0x00
  buf2[2] = 0x00
  buf3[0] = 0x80
  buf3[1] = 0x3f

  bl.append(buf1)
  bl.append(buf2)
  bl.append(buf3)

  t.equal(bl.readFloatLE(2), 0x01)
  t.end()
})

tape('test readDoubleLE / readDoubleBE', function (t) {
  var buf1 = new Buffer(1)
    , buf2 = new Buffer(3)
    , buf3 = new Buffer(10)
    , bl   = new BufferList()

  buf2[1] = 0x55
  buf2[2] = 0x55
  buf3[0] = 0x55
  buf3[1] = 0x55
  buf3[2] = 0x55
  buf3[3] = 0x55
  buf3[4] = 0xd5
  buf3[5] = 0x3f

  bl.append(buf1)
  bl.append(buf2)
  bl.append(buf3)

  t.equal(bl.readDoubleLE(2), 0.3333333333333333)
  t.end()
})

tape('test toString', function (t) {
  var bl = new BufferList()

  bl.append(new Buffer('abcd'))
  bl.append(new Buffer('efg'))
  bl.append(new Buffer('hi'))
  bl.append(new Buffer('j'))

  t.equal(bl.toString('ascii', 0, 10), 'abcdefghij')
  t.equal(bl.toString('ascii', 3, 10), 'defghij')
  t.equal(bl.toString('ascii', 3, 6), 'def')
  t.equal(bl.toString('ascii', 3, 8), 'defgh')
  t.equal(bl.toString('ascii', 5, 10), 'fghij')

  t.end()
})

tape('test toString encoding', function (t) {
  var bl = new BufferList()
    , b  = new Buffer('abcdefghij\xff\x00')

  bl.append(new Buffer('abcd'))
  bl.append(new Buffer('efg'))
  bl.append(new Buffer('hi'))
  bl.append(new Buffer('j'))
  bl.append(new Buffer('\xff\x00'))

  'hex utf8 utf-8 ascii binary base64 ucs2 ucs-2 utf16le utf-16le'
    .split(' ')
    .forEach(function (enc) {
      t.equal(bl.toString(enc), b.toString(enc))
    })

  t.end()
})

tape('test stream', function (t) {
  var random = crypto.randomBytes(1024 * 1024)
    , md5sum = crypto.createHash('md5')
    , rndhash
    , bl     = new BufferList(function (err, _bl) {
        t.ok(bl === _bl)
        t.ok(err === null)
        md5sum = crypto.createHash('md5')
        md5sum.update(bl.slice())
        t.equal(rndhash, md5sum.digest('hex'))

        bl.pipe(fs.createWriteStream('/tmp/bl_test_rnd_out.dat'))
          .on('close', function () {
            var s = fs.createReadStream('/tmp/bl_test_rnd_out.dat')
            md5sum = crypto.createHash('md5')
            s.on('data', md5sum.update.bind(md5sum))
            s.on('end', function() {
              t.equal(rndhash, md5sum.digest('hex'), 'woohoo! correct hash!')
              t.end()
            })
          })

      })

  md5sum.update(random)
  rndhash = md5sum.digest('hex')

  fs.writeFileSync('/tmp/bl_test_rnd.dat', random)
  fs.createReadStream('/tmp/bl_test_rnd.dat').pipe(bl)
})