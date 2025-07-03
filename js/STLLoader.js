/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.STLLoader = function (manager) {

	this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function (url, onLoad, onProgress, onError) {

		var scope = this;

		var loader = new THREE.FileLoader(scope.manager);
		loader.setPath(this.path);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(url, function (text) {

			onLoad(scope.parse(text));

		}, onProgress, onError);

	},

	parse: function (data) {

		function isBinary(data) {

			var expect, face_size, n_faces, reader;
			reader = new DataView(data);
			face_size = (32 / 8 * 3) + (32 / 8 * 3) + (16 / 8);
			n_faces = reader.getUint32(80, true);
			expect = 80 + (32 / 8) + (n_faces * face_size);

			if (expect === reader.byteLength) {

				return true;

			}

			// An ASCII STL data must begin with 'solid ' as the first six bytes.
			// However, ASCII STLs lacking the SPACE after the 'd' are known to be
			// plentiful. So, check the first 5 bytes for 'solid'.

			// Several encodings, such as UTF-8, precede the text with up to 5 bytes:
			// https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
			// Search for "solid" to start anywhere within the first 10 bytes.

			for (var off = 0; off < 10; off++) {

				// If "solid" text is matched to the input, declare it to be an ASCII STL.
				if (('solid' === THREE.LoaderUtils.decodeText(new Uint8Array(data, off, 5)))) return false;

			}

			// Otherwise, assume binary.
			return true;

		}

		function parseBinary(data) {

			var reader = new DataView(data);
			var faces = reader.getUint32(80, true);

			var r, g, b, hasColors = false, colors;
			var defaultR, defaultG, defaultB, alpha;

			// process STL header
			// check for default color in header ("COLOR=rgba" sequence).

			for (var index = 0; index < 80 - 10; index++) {

				if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
					(reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
					(reader.getUint8(index + 5) == 0x3D /*'='*/)) {

					hasColors = true;
					colors = [];

					defaultR = reader.getUint8(index + 6) / 255;
					defaultG = reader.getUint8(index + 7) / 255;
					defaultB = reader.getUint8(index + 8) / 255;
					alpha = reader.getUint8(index + 9) / 255;

				}

			}

			var dataOffset = 84;
			var faceLength = 12 * 4 + 2;

			var geometry = new THREE.BufferGeometry();

			var vertices = [];
			var normals = [];
			var colorsArray = [];

			for (var face = 0; face < faces; face++) {

				var start = dataOffset + face * faceLength;
				var normalX = reader.getFloat32(start, true);
				var normalY = reader.getFloat32(start + 4, true);
				var normalZ = reader.getFloat32(start + 8, true);

				if (hasColors) {

					var packedColor = reader.getUint16(start + 48, true);

					if ((packedColor & 0x8000) === 0) {

						r = (packedColor & 0x1F) / 31;
						g = ((packedColor >> 5) & 0x1F) / 31;
						b = ((packedColor >> 10) & 0x1F) / 31;

					} else {

						r = defaultR;
						g = defaultG;
						b = defaultB;

					}

				}

				for (var i = 1; i <= 3; i++) {

					var vertexstart = start + i * 12;
					vertices.push(reader.getFloat32(vertexstart, true));
					vertices.push(reader.getFloat32(vertexstart + 4, true));
					vertices.push(reader.getFloat32(vertexstart + 8, true));

					normals.push(normalX, normalY, normalZ);

					if (hasColors) {

						colorsArray.push(r, g, b);

					}

				}

			}

			geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
			geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

			if (hasColors) {

				geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3));
				geometry.hasColors = true;
				geometry.alpha = alpha;

			}

			return geometry;

		}

		function parseASCII(data) {

			var geometry, patternFace, patternNormal, patternVertex, patternSolid, patternEndSolid, result, text;
			geometry = new THREE.BufferGeometry();
			var patternFace = /facet([\s\S]*?)endfacet/g;
			var patternNormal = /normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/;
			var patternVertex = /vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g;
			var patternSolid = /solid([\s\S]*?)endsolid/g;
			var patternEndSolid = /endsolid/g;
			var vertices = [];
			var normals = [];

			text = THREE.LoaderUtils.decodeText(new Uint8Array(data));

			var result;

			while ((result = patternFace.exec(text)) !== null) {

				var normal = patternNormal.exec(result[1]);
				if (normal === null) continue;

				for (var i = 0; i < 3; i++) {

					normals.push(parseFloat(normal[1]), parseFloat(normal[2]), parseFloat(normal[3]));

				}

				var vertexMatch;
				while ((vertexMatch = patternVertex.exec(result[1])) !== null) {

					vertices.push(parseFloat(vertexMatch[1]), parseFloat(vertexMatch[2]), parseFloat(vertexMatch[3]));

				}

			}

			geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
			geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

			return geometry;

		}

		var binData = new Uint8Array(data);
		var isBinaryData = isBinary(data);

		return isBinaryData ? parseBinary(data) : parseASCII(data);

	}

};