const db = require('../config/database');

async function insertNodeRecursive(node, organizationId, parentId = null) {
  const [result] = await db.execute(
    `INSERT INTO organization_nodes (parent_id, \`key\`, type, name, title, image, label, organization_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      parentId,
      node.key,
      node.type,
      node.data?.name || null,
      node.data?.title || null,
      node.data?.image || null,
      node.label || null,
      organizationId
    ]
  );
  const newId = result.insertId;

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await insertNodeRecursive(child, organizationId, newId);
    }
  }
}

exports.createOrganizationTree = async (req, res) => {
  try {
    const { organizationId, tree } = req.body;
    if (!organizationId || !tree) {
      return res.status(400).json({ message: 'organizationId and tree are required' });
    }

    // Hapus node lama untuk organisasi ini (optional)
    await db.execute('DELETE FROM organization_nodes WHERE organization_id = ?', [organizationId]);

    await insertNodeRecursive(tree, organizationId);

    res.status(201).json({ message: 'Organization structure saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save organization structure' });
  }
};

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(node => node.parent_id === parentId)
    .map(node => {
      const treeNode = {
        key: node.key,
        type: node.type,
        ...(node.type === 'person'
          ? { data: { name: node.name, title: node.title, image: node.image } }
          : { label: node.label })
      };

      const children = buildTree(nodes, node.id);
      if (children.length > 0) {
        treeNode.children = children;
      }

      return treeNode;
    });
}

exports.getOrganizationTree = async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) {
      return res.status(400).json({ message: 'organizationId query param is required' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM organization_nodes WHERE organization_id = ? ORDER BY id',
      [organizationId]
    );

    const tree = buildTree(rows);
    res.json(tree[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve organization structure' });
  }
};

exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  // Kirim path URL atau relative path yang bisa diakses FE
  const filePath = `/uploads/organization/${req.file.filename}`;
  res.json({ message: 'Upload sukses', path: filePath });
};