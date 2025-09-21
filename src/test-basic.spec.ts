// Test cơ bản để kiểm tra Jest hoạt động
describe('Basic Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const str = 'Hello World';
    expect(str).toContain('Hello');
    expect(str.length).toBe(11);
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
    expect(arr[0]).toBe(1);
  });

  it('should test object operations', () => {
    const obj = {
      id: '123',
      name: 'Test',
      status: 'active'
    };
    
    expect(obj).toHaveProperty('id');
    expect(obj.id).toBe('123');
    expect(obj.name).toBe('Test');
  });
});
