/*
 * Copyright (c) 2010-2019 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */
function createSql(graph) {
	var sql = [];
	var parent = graph.getDefaultParent();
	var childCount = graph.model.getChildCount(parent);

	for (var i=0; i<childCount; i++) {
		var child = graph.model.getChildAt(parent, i);
		
		if (!graph.model.isEdge(child)) {
			if (child.value.type === 'TABLE') {
				sql.push('CREATE TABLE IF NOT EXISTS '+child.value.name+' (');
			
				var columnCount = graph.model.getChildCount(child);

				if (columnCount > 0) {
					for (var j=0; j<columnCount; j++) {
						var column = graph.model.getChildAt(child, j).value;
						
						sql.push('\n    '+column.name+' '+column.type);
						
						if (column.type === 'VARCHAR' || column.type === 'CHAR') {
							sql.push('('+column.columnLength+')');
						}

						
						if (column.notNull) {
							sql.push(' NOT NULL');
						}
												
						if (column.primaryKey) {
							sql.push(' PRIMARY KEY');
						}
						
						if (column.autoIncrement) {
							sql.push(' AUTOINCREMENT');
						}
						
						if (column.unique) {
							sql.push(' UNIQUE');
						}

						if (column.defaultValue != null) {
							sql.push(' DEFAULT '+column.defaultValue);
						}
						
						sql.push(',');
					}
					
					sql.splice(sql.length-1, 1);
					sql.push('\n);');
				}
			} else {
				sql.push('DROP VIEW '+child.value.name+';\n');
				sql.push('CREATE VIEW '+child.value.name+' AS ');
				var column = graph.model.getChildAt(child, 0).value;
				sql.push(column.name + ';\n');
			}
			
			
			sql.push('\n');
		} else {
			sql.push('ALTER TABLE '+child.source.parent.value.name+'\n');
			sql.push('ADD CONSTRAINT '+child.source.parent.value.name+'_' 
				+child.target.parent.value.name+'\n');
			sql.push('FOREIGN KEY ('+child.source.value.name+') REFERENCES ' 
				+child.target.parent.value.name+'('+child.target.value.name+');\n');
			
		}
	}

	return sql.join('');
};
